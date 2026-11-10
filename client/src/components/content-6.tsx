import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Link } from "react-router";

export default function CommunitySection() {
  const { allUsers } = useSelector((state: RootState) => state.auth);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">
            Built by the Community <br /> for the Community
          </h2>
          <p className="mt-4">
            A thriving network of students and companies connecting,
            <br />
            collaborating, and growing careers together.
          </p>
        </div>
        <div className="mx-auto mt-12 flex max-w-lg flex-wrap justify-center gap-3">
          {allUsers.map((user) => (
            <Link
              key={user._id}
              to={user.profile.resume ?? ""}
              target="_blank"
              title="Méschac Irung"
              className="size-16 rounded-full border *:size-full *:rounded-full *:object-cover"
            >
              <img
                alt="John Doe"
                src={user.profile.profilePhoto}
                loading="lazy"
                width={120}
                height={120}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
