export default function StatsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        {/* Heading */}
        <div className="relative z-10 max-w-xl space-y-6">
          <h2 className="text-4xl font-medium lg:text-5xl">
            SypharConnect connects talent with opportunity
          </h2>
          <p>
            SypharConnect is more than a job portal.{" "}
            <span className="font-medium">
              It bridges students and recruiters
            </span>{" "}
            — helping careers grow and companies discover the best talent
            efficiently.
          </p>
        </div>

        {/* Stats & Testimonial */}
        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          {/* Left Column: Stats */}
          <div>
            <p>
              Our platform empowers students to find their dream jobs and allows
              companies to efficiently hire top talent.
            </p>
            <div className="mb-12 mt-12 grid grid-cols-2 gap-2 md:mb-0">
              <div className="space-y-4">
                <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                  +5,000
                </div>
                <p>Registered Students</p>
              </div>
              <div className="space-y-4">
                <div className="bg-linear-to-r from-zinc-950 to-zinc-600 bg-clip-text text-5xl font-bold text-transparent dark:from-white dark:to-zinc-800">
                  +500
                </div>
                <p>Partner Companies</p>
              </div>
            </div>
          </div>

          {/* Right Column: Testimonial */}
          <div className="relative">
            <blockquote className="border-l-4 pl-4">
              <p>
                SypharConnect has transformed how we find and hire top talent.
                The platform is intuitive, fast, and connects us directly with
                qualified students ready to grow their careers.
              </p>

              <div className="mt-6 space-y-3">
                <cite className="block font-medium">
                  Md. Shahabuddin, Founder CEO of SypharConnect
                </cite>
                <img
                  className="size-16 rounded-full "
                  src="https://github.com/xshshahab.png"
                  alt="Google Logo"
                  height="20"
                  width="auto"
                />
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
