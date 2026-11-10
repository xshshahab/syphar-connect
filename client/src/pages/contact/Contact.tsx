import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { toast } from "sonner";

const Contact: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send to a backend endpoint once one exists.
    toast.success("Thanks for reaching out! We'll get back to you soon.");
    setFullName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <section className="mx-auto my-6 w-full max-w-2xl px-4 py-6 md:py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold lg:text-4xl">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Have a question about jobs, hiring or your account? Send us a message
          and our team will reply as soon as possible.
        </p>
      </div>

      <form
        onSubmit={submitFormHandler}
        className="grid grid-cols-1 gap-4 rounded-lg border p-6 sm:grid-cols-2 md:p-8"
      >
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            required
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:col-span-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            type="text"
            id="subject"
            name="subject"
            required
            placeholder="How can we help?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button type="submit" className="sm:col-span-2 cursor-pointer">
          Send Message
        </Button>
      </form>
    </section>
  );
};

export default Contact;
