import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, GraduationCap, Search, Target, Eye } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const steps = [
  {
    icon: GraduationCap,
    title: "Create your profile",
    description:
      "Students sign up, add their details and resume, and get ready to apply.",
  },
  {
    icon: Search,
    title: "Discover opportunities",
    description:
      "Browse and filter open roles by location, industry and salary to find the right fit.",
  },
  {
    icon: Building2,
    title: "Hire with confidence",
    description:
      "Companies register, post jobs and manage applicants and their status in one place.",
  },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make job hunting and hiring simple, transparent and fast by bringing students and recruiters onto a single platform.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A world where every student can find a role that matches their skills, and every company can discover the talent it needs.",
  },
];

const About: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-10 md:py-16 space-y-16">
      <section className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-semibold lg:text-5xl">
          About SypharConnect
        </h1>
        <p className="text-muted-foreground">
          SypharConnect is more than a job portal.{" "}
          <span className="font-medium text-foreground">
            It bridges students and recruiters
          </span>{" "}
          — helping careers grow and companies discover the best talent
          efficiently.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {values.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-lg border">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-medium">{title}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-semibold">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg border">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-3xl font-bold text-muted-foreground/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-medium">{title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-lg border p-8 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to get started?</h2>
        <p className="text-muted-foreground">
          Find your next role or your next hire today.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link to="/jobs">Browse Jobs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
