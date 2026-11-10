import bcrypt
import jwt

PDF = ("resume.pdf", b"%PDF-1.4 fake", "application/pdf")
JOB = {
    "title": "React Front-End Developer",
    "description": "<p>Build <strong>UI</strong><script>alert(1)</script></p>",
    "requirements": "react, typescript, ",
    "salary": "12",
    "location": "Bengaluru",
    "jobType": "Full-time",
    "experience": "2",
    "position": "3",
}


def make_company(client, headers, name="Acme"):
    r = client.post("/api/v1/register-company", json={"companyName": name}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()["company"]


def make_job(client, headers, company_id, **over):
    r = client.post(
        "/api/job/create-job", json={**JOB, "companyId": company_id, **over}, headers=headers
    )
    assert r.status_code == 201, r.text
    return r.json()["job"]


# ----- health / auth --------------------------------------------------------


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"api": "ok", "db": "connected"}


def test_protected_routes_need_login(client):
    r = client.get("/api/job/all-job")
    assert r.status_code == 401
    assert r.json() == {"message": "User Not Authenticated", "success": False}
    r = client.get("/api/job/all-job", headers={"Cookie": "token=garbage"})
    assert r.status_code == 401
    assert r.json()["message"] == "Session expired. Please log in again."


def test_unknown_route_and_bad_json_answer_in_json(client):
    assert client.get("/api/nope").json() == {"message": "Not found", "success": False}
    r = client.post("/api/auth/user/login", content="{oops", headers={"Content-Type": "application/json"})
    assert r.status_code == 400 and r.json()["success"] is False


def test_register_login_logout(client):
    r = client.post("/api/auth/user/register", data={"fullName": "A"})
    assert r.status_code == 400
    assert r.json() == {"message": "Missing: Required fields", "success": False}

    form = {"fullName": "Asha", "email": "asha@example.com", "phoneNumber": "1", "password": "pw1", "role": "student"}
    assert client.post("/api/auth/user/register", data=form).status_code == 201
    dup = client.post("/api/auth/user/register", data=form)
    assert (dup.status_code, dup.json()["message"]) == (400, "User already exist")
    bad_role = client.post("/api/auth/user/register", data={**form, "email": "x@example.com", "role": "admin"})
    assert bad_role.status_code == 400

    wrong = client.post("/api/auth/user/login", json={"email": "asha@example.com", "password": "nope"})
    assert (wrong.status_code, wrong.json()["message"]) == (400, "Incorect email or password.")

    r = client.post("/api/auth/user/login", json={"email": "asha@example.com", "password": "pw1"})
    assert r.status_code == 200
    body = r.json()
    assert body["message"] == "Welcome back Asha" and body["success"] is True
    user = body["user"]
    assert set(user) == {"_id", "fullName", "email", "phoneNumber", "role", "profile"}
    assert "password" not in user
    assert user["profile"]["profilePhoto"] == "https://github.com/shadcn.png"
    assert user["profile"]["skills"] == []

    cookie = r.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=strict" in cookie and "secure" not in cookie
    assert jwt.decode(r.cookies["token"], "test-secret-test-secret-test-secret-0123", algorithms=["HS256"])["userId"] == user["_id"]

    out = client.get("/api/auth/user/logout")
    assert out.json() == {"message": "User logged out successfully", "success": True}
    assert "max-age=0" in out.headers["set-cookie"].lower()


def test_login_accepts_password_hashed_by_bcryptjs(client):
    """Existing users migrated from MongoDB keep their $2a/$2b hashes."""
    import asyncio, uuid
    from sqlalchemy import insert
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.pool import NullPool
    from app.db import async_database_url
    from app.models import User
    from tests.conftest import TEST_DB

    legacy = bcrypt.hashpw(b"old-password", bcrypt.gensalt(10, prefix=b"2a")).decode()
    assert legacy.startswith("$2a$")

    async def seed():
        engine = create_async_engine(async_database_url(TEST_DB), poolclass=NullPool)
        async with engine.begin() as conn:
            await conn.execute(insert(User).values(
                id=uuid.uuid4(), full_name="Old", email="old@example.com", password=legacy,
                phone_number="1", role="student"))
        await engine.dispose()

    asyncio.run(seed())
    r = client.post("/api/auth/user/login", json={"email": "old@example.com", "password": "old-password"})
    assert r.status_code == 200


# ----- profile + uploads ----------------------------------------------------


def test_profile_update_and_uploads(client, make_user):
    user, h = make_user("student")
    uid = user["_id"]

    r = client.put(
        f"/api/auth/user/profile/update-profile/{uid}",
        data={"bio": "Hello", "skills": "react, sql", "fullName": "New Name"},
        files={"file": PDF, "profilePhoto": ("me.png", b"\x89PNG fake", "image/png")},
        headers=h,
    )
    assert r.status_code == 200, r.text
    p = r.json()["user"]
    assert p["fullName"] == "New Name"
    assert p["profile"]["bio"] == "Hello"
    assert p["profile"]["skills"] == ["react", "sql"]
    assert p["profile"]["resumeOriginalName"] == "resume.pdf"
    assert p["profile"]["resume"].startswith("http://testserver/uploads/")

    # the stored file is served back at the saved link
    served = client.get(p["profile"]["resume"].replace("http://testserver", ""))
    assert served.status_code == 200 and served.content == PDF[1]

    # someone else's profile is off limits
    other, _ = make_user("student")
    r = client.put(f"/api/auth/user/profile/update-profile/{other['_id']}", data={"bio": "x"}, headers=h)
    assert r.status_code == 403


def test_upload_rules(client, make_user, tmp_path):
    import os
    from app.config import settings

    user, h = make_user("student")
    url = f"/api/auth/user/profile/update-profile/{user['_id']}"
    before = set(os.listdir(settings.upload_path))

    bad_type = client.put(url, files={"file": ("x.exe", b"MZ", "application/octet-stream")}, headers=h)
    assert bad_type.status_code == 400 and "allowed" in bad_type.json()["message"]
    # a PDF extension with an image content type is also refused
    mismatch = client.put(url, files={"file": ("x.pdf", b"x", "image/png")}, headers=h)
    assert mismatch.status_code == 400

    big = client.put(url, files={"file": ("big.pdf", b"0" * (5 * 1024 * 1024 + 1), "application/pdf")}, headers=h)
    assert big.status_code == 400
    assert big.json()["message"] == "File too large. Maximum size is 5MB"

    # a request that fails after the file was saved leaves no orphan behind
    forbidden = client.put(
        f"/api/auth/user/profile/update-profile/{'0' * 8}-0000-0000-0000-{'0' * 12}",
        files={"file": PDF}, headers=h)
    assert forbidden.status_code == 403
    assert set(os.listdir(settings.upload_path)) == before


# ----- companies ------------------------------------------------------------


def test_company_lifecycle(client, make_user):
    _, rec = make_user("recruiter")
    _, other = make_user("recruiter")

    assert client.get("/api/v1/companies", headers=rec).status_code == 404
    assert client.post("/api/v1/register-company", json={}, headers=rec).status_code == 400

    c = make_company(client, rec, "Acme")
    assert set(c) == {"_id", "name", "description", "website", "location", "logo", "userId", "createdAt", "updatedAt"}
    assert c["createdAt"].endswith("Z")

    dup = client.post("/api/v1/register-company", json={"companyName": "Acme"}, headers=other)
    assert dup.json()["message"] == "You can't register the same company again"

    client.post("/api/v1/register-company", json={"companyName": "Beta", "website": "https://b.io"}, headers=rec)
    same_site = client.post("/api/v1/register-company",
                            json={"companyName": "Gamma", "website": "https://b.io"}, headers=other)
    assert same_site.json()["message"] == "This website is already registered for another company"

    assert [x["name"] for x in client.get("/api/v1/companies", headers=rec).json()["companies"]] == ["Acme", "Beta"]

    assert client.get(f"/api/v1/company/{c['_id']}", headers=rec).status_code == 200
    assert client.get(f"/api/v1/company/{c['_id']}", headers=other).status_code == 403
    assert client.get("/api/v1/company/not-an-id", headers=rec).status_code == 404

    r = client.put(f"/api/v1/company/update-company/{c['_id']}",
                   data={"name": "Acme Inc", "location": "Pune"}, files={"file": ("logo.png", b"png", "image/png")},
                   headers=rec)
    assert r.status_code == 200 and r.json()["message"] == "Company Information updated"
    got = client.get(f"/api/v1/company/{c['_id']}", headers=rec).json()["company"]
    assert (got["name"], got["location"]) == ("Acme Inc", "Pune")
    assert got["logo"].startswith("http://testserver/uploads/")

    assert client.put(f"/api/v1/company/update-company/{c['_id']}", data={"name": "Hax"}, headers=other).status_code == 404
    assert client.delete(f"/api/v1/company/delete/{c['_id']}", headers=other).status_code == 404
    assert client.delete(f"/api/v1/company/delete/{c['_id']}", headers=rec).status_code == 200


def test_deleting_a_company_keeps_its_jobs(client, make_user):
    _, rec = make_user("recruiter")
    c = make_company(client, rec)
    job = make_job(client, rec, c["_id"])
    client.delete(f"/api/v1/company/delete/{c['_id']}", headers=rec)
    jobs = client.get("/api/job/all-job", headers=rec).json()["jobs"]
    assert [j["_id"] for j in jobs] == [job["_id"]] and jobs[0]["company"] is None


# ----- jobs -----------------------------------------------------------------


def test_post_job_validation_and_sanitizing(client, make_user):
    _, rec = make_user("recruiter")
    c = make_company(client, rec)

    job = make_job(client, rec, c["_id"])
    assert job["description"] == "<p>Build <strong>UI</strong></p>"  # <script> removed
    assert job["requirements"] == ["react", "typescript"]
    assert (job["salary"], job["experienceLevel"], job["position"]) == (12, 2, 3)
    assert job["company"] == c["_id"] and job["applications"] == []

    # experience 0 is valid (freshers)
    assert make_job(client, rec, c["_id"], experience=0)["experienceLevel"] == 0

    def bad(**over):
        r = client.post("/api/job/create-job", json={**JOB, "companyId": c["_id"], **over}, headers=rec)
        assert r.status_code == 400, r.text
        return r.json()["message"]

    assert bad(title="") == "Missing required fields."
    assert bad(description="<script>x</script>") == "Missing required fields."
    assert bad(requirements=" , ") == "Add at least one requirement."
    assert bad(requirements=5) .startswith("Invalid format for requirements")
    assert bad(salary="lots") == "Salary must be a number."
    assert bad(experience="-1").startswith("Experience must be")
    assert bad(position="1.5").startswith("Position must be")
    assert make_job(client, rec, c["_id"], requirements=["a", " b "])["requirements"] == ["a", "b"]


def test_job_search_filters(client, make_user):
    _, rec = make_user("recruiter")
    _, stu = make_user("student")
    c = make_company(client, rec)
    make_job(client, rec, c["_id"], title="React Front-End Developer", location="Bangalore", salary=12, jobType="Full-time", experience=2)
    make_job(client, rec, c["_id"], title="Backend Engineer (Node)", location="Noida", salary=25, jobType="Contract", experience=5,
             description="<p>APIs and 100% uptime_ok</p>")
    make_job(client, rec, c["_id"], title="Data Analyst", location="Pune", salary=7, jobType="Full-time", experience=0)

    def find(**params):
        r = client.get("/api/job/all-job", params=params, headers=stu)
        assert r.status_code == 200, r.text
        return sorted(j["title"] for j in r.json()["jobs"])

    assert len(find()) == 3
    assert find(keyword="react") == ["React Front-End Developer"]
    assert find(keyword="100%") == ["Backend Engineer (Node)"]            # % is literal, not a wildcard
    assert find(keyword="%") == ["Backend Engineer (Node)"]
    assert find(location="Banglore") == ["React Front-End Developer"]      # spelling alias
    assert find(location="Delhi NCR") == ["Backend Engineer (Node)"]       # Noida is in NCR
    assert find(location=["Pune", "Delhi NCR"]) == ["Backend Engineer (Node)", "Data Analyst"]
    assert find(industry="Frontend Developer") == ["React Front-End Developer"]
    assert find(industry="data science") == ["Data Analyst"]
    assert find(industry="react developer") == ["React Front-End Developer"]  # every word
    assert find(industry="c++ (") == []                                     # regex characters are escaped
    assert find(jobType="full-time") == ["Data Analyst", "React Front-End Developer"]
    assert find(salary="6-10") == ["Data Analyst"]
    assert find(salary="20+") == ["Backend Engineer (Node)"]
    assert find(salary=["6-10", "20+"]) == ["Backend Engineer (Node)", "Data Analyst"]
    assert find(salary="junk") == find()
    assert find(experience="0") == ["Data Analyst"]
    assert find(experience="3") == ["Data Analyst", "React Front-End Developer"]
    assert find(location="Pune", jobType="Contract") == []                   # groups are ANDed

    jobs = client.get("/api/job/all-job", headers=stu).json()["jobs"]
    assert [j["title"] for j in jobs] == ["Data Analyst", "Backend Engineer (Node)", "React Front-End Developer"]  # newest first
    assert jobs[0]["company"]["name"] == "Acme" and jobs[0]["applications"] == []


def test_job_by_id_and_admin_jobs(client, make_user):
    _, rec = make_user("recruiter")
    _, stu = make_user("student")
    c = make_company(client, rec)
    j1 = make_job(client, rec, c["_id"], title="One")
    make_job(client, rec, c["_id"], title="Two")

    detail = client.get(f"/api/job/fetch-by-id/{j1['_id']}", headers=stu).json()["job"]
    assert detail["title"] == "One"
    # the job page shows the company's details, so the full company is included
    assert detail["company"]["_id"] == c["_id"] and detail["company"]["name"] == "Acme"
    assert client.get("/api/job/fetch-by-id/zzz", headers=stu).status_code == 404

    admin = client.get("/api/job/admin-job", headers=rec).json()["jobs"]
    assert [j["title"] for j in admin] == ["One", "Two"]
    assert admin[0]["company"]["name"] == "Acme" and admin[0]["pendingApplications"] == 0
    assert client.get("/api/job/admin-job", headers=stu).json()["jobs"] == []


def test_saved_jobs(client, make_user):
    _, rec = make_user("recruiter")
    stu_user, stu = make_user("student")
    c = make_company(client, rec)
    a = make_job(client, rec, c["_id"], title="A")
    b = make_job(client, rec, c["_id"], title="B")

    assert client.get("/api/job/saved", headers=stu).json()["jobs"] == []
    assert client.post("/api/job/save/nope", headers=stu).status_code == 400
    assert client.post(f"/api/job/save/{'0' * 8}-0000-0000-0000-{'0' * 12}", headers=stu).status_code == 404

    assert client.post(f"/api/job/save/{a['_id']}", headers=stu).json()["message"] == "Job saved for later."
    assert client.post(f"/api/job/save/{a['_id']}", headers=stu).status_code == 200   # saving twice is fine
    assert client.post(f"/api/job/save/{b['_id']}", headers=stu).status_code == 200

    saved = client.get("/api/job/saved", headers=stu).json()["jobs"]
    assert [j["title"] for j in saved] == ["B", "A"]                                 # newest saved first
    assert saved[0]["company"]["name"] == "Acme"

    users = client.get("/api/auth/user/fetch-all-users", headers=stu).json()["users"]
    me = next(u for u in users if u["_id"] == stu_user["_id"])
    assert sorted(me["savedJobs"]) == sorted([a["_id"], b["_id"]])

    assert client.delete(f"/api/job/save/{a['_id']}", headers=stu).status_code == 200
    assert [j["title"] for j in client.get("/api/job/saved", headers=stu).json()["jobs"]] == ["B"]


def test_fetch_all_users(client, make_user):
    make_user("recruiter"); make_user("student"); _, h = make_user("student")
    r = client.get("/api/auth/user/fetch-all-users", headers=h).json()
    assert len(r["users"]) == 3 and all("password" not in u for u in r["users"])
    only = client.get("/api/auth/user/fetch-all-users", params={"role": "recruiter"}, headers=h).json()
    assert [u["role"] for u in only["users"]] == ["recruiter"]


# ----- applications ---------------------------------------------------------


def test_application_flow(client, make_user):
    rec_user, rec = make_user("recruiter")
    stu_user, stu = make_user("student")
    _, stu2 = make_user("student")
    _, rec2 = make_user("recruiter")
    c = make_company(client, rec)
    job = make_job(client, rec, c["_id"])
    apply_url = f"/api/application/apply/{job['_id']}"

    # recruiters cannot apply; students need a resume first
    assert client.get(apply_url, headers=rec).status_code == 403
    r = client.get(apply_url, headers=stu)
    assert r.status_code == 400 and r.json()["needsResume"] is True and r.json()["success"] is False
    assert client.get("/api/application/apply/zzz", headers=stu).status_code == 404

    client.put(f"/api/auth/user/profile/update-profile/{stu_user['_id']}", files={"file": PDF}, headers=stu)
    r = client.get(apply_url, headers=stu)
    assert (r.status_code, r.json()) == (201, {"message": "Job applied successfully!", "success": True})
    again = client.get(apply_url, headers=stu)
    assert (again.status_code, again.json()["message"]) == (400, "You've already applied for this job")

    # job detail shows application objects; list endpoints only the ids
    detail = client.get(f"/api/job/fetch-by-id/{job['_id']}", headers=stu).json()["job"]
    app_row = detail["applications"][0]
    assert app_row["applicant"] == stu_user["_id"] and app_row["status"] == "PENDING"
    listed = client.get("/api/job/all-job", headers=stu).json()["jobs"][0]
    assert listed["applications"] == [app_row["_id"]]

    admin = client.get("/api/job/admin-job", headers=rec).json()["jobs"][0]
    assert admin["pendingApplications"] == 1

    applied = client.get("/api/application/applied-job", headers=stu).json()["application"]
    assert len(applied) == 1 and applied[0]["status"] == "PENDING"
    assert applied[0]["job"]["title"] == job["title"] and applied[0]["job"]["company"]["name"] == "Acme"
    assert client.get("/api/application/applied-job", headers=stu2).json()["application"] == []

    # applicants: only the job's recruiter, newest first, applicant without password
    assert client.get(f"/api/application/applicants/{job['_id']}", headers=rec2).status_code == 403
    assert client.get(f"/api/application/applicants/{job['_id']}", headers=stu).status_code == 403
    r = client.get(f"/api/application/applicants/{job['_id']}", headers=rec)
    applicant = r.json()["job"]["applications"][0]["applicant"]
    assert applicant["email"] == stu_user["email"] and "password" not in applicant
    assert applicant["profile"]["resume"].endswith(".pdf")

    # status changes: only the job's recruiter, valid values only
    upd = f"/api/application/update-status/{app_row['_id']}"
    assert client.post(upd, json={"status": "accepted"}, headers=rec2).status_code == 403
    assert client.post(upd, json={"status": "maybe"}, headers=rec).status_code == 400
    assert client.post(upd, json={}, headers=rec).json()["message"] == "Status is required"
    assert client.post("/api/application/update-status/zzz", json={"status": "accepted"}, headers=rec).status_code == 400
    ok = client.post(upd, json={"status": "accepted"}, headers=rec)
    assert (ok.status_code, ok.json()["message"]) == (200, "Status updated successsfully!")
    assert client.get("/api/application/applied-job", headers=stu).json()["application"][0]["status"] == "ACCEPTED"
    assert client.get("/api/job/admin-job", headers=rec).json()["jobs"][0]["pendingApplications"] == 0
