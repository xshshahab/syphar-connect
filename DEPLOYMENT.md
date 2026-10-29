# Deploying SypharConnect on a VPS

This guide puts the whole app on **https://jobs.shahabuddin.in**, so your portfolio can stay on **shahabuddin.in** untouched.

It assumes a fresh **Ubuntu 22.04 / 24.04** VPS where you have `sudo`. Commands are copy-paste ready; replace the values written in `UPPER_CASE`.

> Logged in as `root`? Everything still works (`sudo` is simply not needed, and `$USER` is `root`). For a long-lived server it is safer to create a normal user with `adduser deploy && usermod -aG sudo deploy`, copy your SSH key to it, and run the app as that user.

---

## 1. How it will run

One domain serves everything. Nginx is the only thing exposed to the internet:

```
Browser ──HTTPS──▶ Nginx (jobs.shahabuddin.in)
                     ├── /            → React app (static files from client/dist)
                     ├── /api/*       → Node/Express on 127.0.0.1:8080
                     └── /uploads/*   → Node/Express (profile photos, logos, resumes)

Node/Express ──▶ MongoDB   (Atlas, or MongoDB on the same server)
              └─▶ UPLOAD_DIR  (/var/data/syphar-uploads)
```

Because the app and the API share one origin:

- no CORS setup is needed,
- the login cookie works without any cross-site tricks,
- the client needs no API address: in a production build it calls `/api/...` on whatever domain it was loaded from.

## 2. What you need before starting

| Item | Notes |
| --- | --- |
| A VPS | 1 GB RAM is enough to run it. Building the client wants about 1 GB free; if yours is smaller, see [build on your own computer](#build-on-your-own-computer-instead). |
| The VPS's public IP | Shown in your VPS provider's dashboard. |
| Access to the DNS of `shahabuddin.in` | At your domain registrar, or wherever the domain's DNS is managed. |
| A MongoDB database | [MongoDB Atlas](https://www.mongodb.com/atlas) (free, recommended) or MongoDB on the VPS. |

---

## 3. Point the subdomain at the VPS

Add **one** DNS record. Do not change the records for `shahabuddin.in` or `www`; those keep serving your portfolio.

| Type | Name / Host | Value | TTL |
| --- | --- | --- | --- |
| `A` | `jobs` | your VPS IPv4 address | 300 |
| `AAAA` *(only if the VPS has IPv6)* | `jobs` | your VPS IPv6 address | 300 |

**If your DNS is at GoDaddy** (the nameservers end in `domaincontrol.com`; check with `dig +short NS shahabuddin.in`): sign in, then **My Products** > your domain > **DNS** > **Add New Record**. Choose Type `A`, Name `jobs`, Value = your VPS IP, TTL `600 seconds`, and **Save**. Leave the existing `@` and `www` records alone.

Find your VPS IP by running this **on the VPS**:

```bash
curl -4 ifconfig.me
```

> **Stop here until DNS works.** Certbot (step 9) fails with `NXDOMAIN` if the record does not exist yet. Check it from any machine:
>
> ```bash
> dig +short jobs.shahabuddin.in
> # must print your VPS IP; an empty answer means the record is missing or not saved
> ```
>
> Want to test the server before DNS is ready? Ask it directly for the hostname (after step 9's nginx config is in place):
> `curl -I --resolve jobs.shahabuddin.in:80:YOUR_VPS_IP http://jobs.shahabuddin.in/`

> If your portfolio lives on the same VPS, nothing changes for it: nginx tells the sites apart by `server_name`. If it lives elsewhere (Vercel, Netlify, another host), it is also unaffected, because only the `jobs` record points here.

---

## 4. Prepare the server

SSH in, then update and install the basics.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git ufw curl ca-certificates gnupg
```

### Firewall

Only SSH and web traffic should be reachable. Port `8080` (the API) stays private.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### Node.js (version 20 or newer)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22.x
```

### PM2 (keeps the API running and restarts it after a reboot)

```bash
sudo npm install -g pm2
```

---

## 5. Set up MongoDB

Choose **one** option.

### Option A: MongoDB Atlas (recommended)

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access** → add a database user with a strong password.
3. **Network Access** → add your VPS's IP address (not `0.0.0.0/0`).
4. **Connect → Drivers** → copy the connection string. It looks like:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/syphar-connect?retryWrites=true&w=majority
   ```

   Put your database name (`syphar-connect`) before the `?`. If the password contains special characters such as `@` or `#`, URL-encode them.

### Option B: MongoDB on the same VPS

1. Install MongoDB Community Edition by following the official steps for your Ubuntu version: <https://www.mongodb.com/docs/manual/administration/install-on-linux/>.
2. Start it and make it run at boot:

   ```bash
   sudo systemctl enable --now mongod
   ```

3. Create a user for the app:

   ```bash
   mongosh
   ```

   ```js
   use syphar-connect
   db.createUser({
     user: "syphar",
     pwd: "A_STRONG_PASSWORD",
     roles: [{ role: "readWrite", db: "syphar-connect" }]
   })
   exit
   ```

4. Turn on authentication: in `/etc/mongod.conf` make sure these are set, then `sudo systemctl restart mongod`.

   ```yaml
   net:
     bindIp: 127.0.0.1      # only this server can connect
   security:
     authorization: enabled
   ```

5. Your connection string is:

   ```
   mongodb://syphar:A_STRONG_PASSWORD@127.0.0.1:27017/syphar-connect?authSource=syphar-connect
   ```

---

## 6. Get the code on the server

```bash
sudo mkdir -p /var/www/syphar-connect /var/data/syphar-uploads
sudo chown -R $USER:$USER /var/www/syphar-connect /var/data/syphar-uploads

git clone https://github.com/xshshahab/syphar-connect.git /var/www/syphar-connect
cd /var/www/syphar-connect
```

- `/var/www/syphar-connect` holds the code.
- `/var/data/syphar-uploads` holds uploaded photos, logos and resumes. It is deliberately **outside** the code folder, so updating the code can never touch it.

> If the repository is private, [add a deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) to it and clone with the SSH address instead.

---

## 7. Configure and start the backend

```bash
cd /var/www/syphar-connect/backend
npm ci --omit=dev
cp .env.sample .env
nano .env
chmod 600 .env
```

Generate a long random secret for signing logins:

```bash
openssl rand -hex 48
```

Fill in `.env` like this:

```ini
NODE_ENV=production
PORT=8080

# from step 5
MONGO_URI=PASTE_YOUR_CONNECTION_STRING

# the output of: openssl rand -hex 48
SECRET_KEY=PASTE_THE_RANDOM_VALUE

# where uploaded files live (created in step 6)
UPLOAD_DIR=/var/data/syphar-uploads

# used to build the links to uploaded files
BASE_URL=https://jobs.shahabuddin.in
```

> `NODE_ENV=production` makes the login cookie HTTPS-only. That is correct for the live site, but it means login will not work if you open the site over plain `http://`. Finish the HTTPS step (section 9) before testing logins.

Start the API with PM2 and make it survive reboots:

```bash
pm2 start index.js --name syphar-api --cwd /var/www/syphar-connect/backend
pm2 save
pm2 startup
# PM2 prints one command starting with "sudo env PATH=..."; copy and run it, then:
pm2 save
```

Check it:

```bash
pm2 status                 # syphar-api should be "online"
pm2 logs syphar-api --lines 20
curl -s http://127.0.0.1:8080/api/job/all-job
# {"message":"User Not Authenticated","success":false}   ← the API is up (it needs a login)
```

You should also see `MONGO DB connected successfully!` in the logs. If you see a connection error instead, recheck `MONGO_URI` and the Atlas IP allow-list.

There is also a health check that reports the database state. It must say `"db":"connected"` before you move on:

```bash
curl -s http://127.0.0.1:8080/api/health
# {"api":"ok","db":"connected"}
```

---

## 8. Build the client

```bash
cd /var/www/syphar-connect/client
npm ci
npm run build
```

This creates `client/dist`, the static site nginx will serve. No environment variable is needed: a production build calls `/api/...` on the same domain.

### Build on your own computer instead

**Skip this section if the build above worked.** It is only for a VPS that runs out of memory while building. Build on your own computer and upload just the result:

```bash
# run these on YOUR COMPUTER (not on the VPS), inside the project folder
cd client && npm ci && npm run build

# copy it to the server
rsync -avz --delete dist/ USER@YOUR_VPS_IP:/var/www/syphar-connect/client/dist/
```

---

## 9. Nginx and HTTPS

Create the site config:

```bash
sudo nano /etc/nginx/sites-available/jobs.shahabuddin.in
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name jobs.shahabuddin.in;

    root /var/www/syphar-connect/client/dist;
    index index.html;

    # resumes and images are up to 5 MB
    client_max_body_size 6m;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # uploaded photos, logos and resumes
    location /uploads/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header X-Content-Type-Options nosniff always;
    }

    # built files have hashed names, so they can be cached for a long time
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # never cache the entry page, so new deployments show up immediately
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # single-page app: any other URL (for example /jobs or /profile) loads the app
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable it and check the syntax:

```bash
sudo ln -s /etc/nginx/sites-available/jobs.shahabuddin.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Free HTTPS certificate

DNS from step 3 must already point at the VPS.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d jobs.shahabuddin.in
```

Choose to **redirect HTTP to HTTPS** when asked. Certbot edits the config for you and sets up automatic renewal. Confirm renewal works:

```bash
sudo certbot renew --dry-run
```

Now open **https://jobs.shahabuddin.in**. The onboarding screen should appear. Create a recruiter account, register a company and post a job to confirm everything works end to end.

---

## 10. Updating the site later

Create the script once, on the VPS. This single command writes the file for you (paste it as-is):

```bash
cat > /var/www/syphar-connect/deploy.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/syphar-connect

git pull --ff-only
(cd backend && npm ci --omit=dev)
(cd client && npm ci && npm run build)
pm2 restart syphar-api --update-env

echo "Deployed."
EOF
chmod +x /var/www/syphar-connect/deploy.sh
```

Then run `/var/www/syphar-connect/deploy.sh` whenever you push changes to GitHub. Your `.env` and the uploads folder are outside git, so they are never overwritten.

---

## 11. Backups

What needs backing up: the **database** and the **uploads folder**.

```bash
sudo mkdir -p /var/backups/syphar && sudo chown $USER: /var/backups/syphar
```

Add the nightly jobs. This appends to your crontab without opening an editor (inside cron the `%` signs must stay escaped as `\%`):

```bash
( crontab -l 2>/dev/null
  echo '0 3 * * * tar -czf /var/backups/syphar/uploads-$(date +\%F).tgz -C /var/data syphar-uploads'
  echo '30 3 * * * find /var/backups/syphar -type f -mtime +14 -delete'
) | crontab -
crontab -l    # confirm the lines are there
```

If MongoDB runs on the VPS (not Atlas, which has its own backups), also add a database dump. Install the tool first with `sudo apt install -y mongodb-database-tools`, then:

```bash
( crontab -l
  echo '0 3 * * * mongodump --uri="YOUR_MONGO_URI" --gzip --archive=/var/backups/syphar/db-$(date +\%F).gz'
) | crontab -
```

Copy `/var/backups/syphar` to another machine or storage bucket now and then; backups on the same server will not help if the server is lost.

---

## 12. Security checklist

- [ ] `.env` has `chmod 600`, and `SECRET_KEY` is a long random value (not the sample one).
- [ ] The firewall allows only SSH and `Nginx Full`; `sudo ufw status` shows no `8080`.
- [ ] MongoDB is **not** open to the internet (Atlas allow-list holds only your VPS IP, or local MongoDB is bound to `127.0.0.1` with authentication on).
- [ ] You log in to the VPS with an SSH key, and password login is disabled (`PasswordAuthentication no` in `/etc/ssh/sshd_config`).
- [ ] Automatic security updates: `sudo apt install -y unattended-upgrades`.
- [ ] Optional: `sudo apt install -y fail2ban` to block repeated SSH login attempts.

---

## 13. Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| Certbot: `NXDOMAIN looking up A for jobs.shahabuddin.in` | The DNS record does not exist yet (step 3). Add the `A` record, wait until `dig +short jobs.shahabuddin.in` prints your VPS IP, then run certbot again. |
| The page loads but nothing works (login, jobs) and the browser console shows requests to `localhost:8080` | The client was built from old code. Pull the latest code and rebuild with `/var/www/syphar-connect/deploy.sh`. Check with `grep -c localhost:8080 /var/www/syphar-connect/client/dist/assets/index-*.js`, which must print `0`. |
| **504 Gateway Time-out** on signup/login, or "Server error while ..." | The API is running but cannot do its work, almost always because **MongoDB is not connected**. Run `curl -s https://jobs.shahabuddin.in/api/health`: `{"api":"ok","db":"connected"}` is healthy; `"db":"disconnected"` means a wrong `MONGO_URI`, a wrong password, Atlas not allowing your VPS IP, or local MongoDB not running (`sudo systemctl status mongod`). The real reason is in `pm2 logs syphar-api --lines 40 --nostream`. |
| **502 Bad Gateway** | The API is not running. `pm2 status`, then `pm2 logs syphar-api`. |
| Site loads but every action fails | The browser can't reach `/api`. Run `curl -i https://jobs.shahabuddin.in/api/job/all-job`; you should get `401` JSON. A `404` or HTML page means the `location /api/` block is missing or not loaded (`sudo nginx -t`). |
| Can't log in / sent back to login | The login cookie only works on HTTPS in production. Use `https://`, and confirm `NODE_ENV=production` together with a valid certificate. |
| **404 when refreshing** a page like `/jobs` | The `location /` block with `try_files ... /index.html` is missing. |
| **413 Request Entity Too Large** on upload | `client_max_body_size 6m;` is missing from the nginx config. |
| Uploaded images show as broken | `BASE_URL` is wrong or missing in `.env`, or the `/uploads/` location is missing. Restart after changing `.env`: `pm2 restart syphar-api --update-env`. |
| Upload fails with a server error | The folder in `UPLOAD_DIR` doesn't exist or isn't writable by the user running PM2: `ls -ld /var/data/syphar-uploads`. |
| `MongoServerError` / connection errors in the logs | Wrong `MONGO_URI`, wrong password encoding, or your VPS IP is not in the Atlas allow-list. |
| Old version still showing after a deploy | Hard-refresh the browser (Ctrl+Shift+R). Make sure `npm run build` finished without errors. |
| Certbot says the domain doesn't resolve | The DNS record from step 3 hasn't spread yet. Wait, re-check with `dig +short jobs.shahabuddin.in`, and try again. |

Useful commands:

```bash
pm2 logs syphar-api            # live API logs
pm2 restart syphar-api         # restart the API
sudo tail -f /var/log/nginx/error.log
sudo nginx -t && sudo systemctl reload nginx
```

---

## 14. How the app was made deploy-ready

These settings are already in the code; you don't need to change them:

- **`client/src/utils/constant.ts`**: the API address is `/api` on the same domain in production builds, and `http://localhost:8080` in development. Set `VITE_API_URL` at build time only if you ever host the API on a different domain.
- **`backend/index.js`**: trusts nginx's forwarded headers, and takes the allowed browser origin from `CLIENT_URL` (only needed when the client and API are on different domains).
- **Login cookie**: `HttpOnly`, `SameSite=Strict`, and HTTPS-only when `NODE_ENV=production`.
- **`backend/package.json`**: has an `npm start` script (`node index.js`) if you prefer it over calling PM2 on `index.js`.
