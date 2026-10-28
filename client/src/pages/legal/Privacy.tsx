import React from "react";
import LegalPage, { type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    paragraphs: [
      "When you create an account we collect your full name, email address, phone number, role (student or recruiter) and an optional profile image. Students may also add a resume and profile details, and recruiters may add company information and job postings.",
      "We also keep records of your activity on the platform, such as the jobs you apply to and the status of those applications.",
    ],
  },
  {
    heading: "How we use your information",
    paragraphs: [
      "We use your information to create and manage your account, show you relevant jobs, let recruiters review applications, and respond to your messages.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    heading: "Who can see your information",
    paragraphs: [
      "When you apply for a job, the recruiter who posted it can see the details in your profile and your application. Other users cannot see your private account information.",
    ],
  },
  {
    heading: "Cookies and authentication",
    paragraphs: [
      "We use a secure cookie to keep you logged in. It is used only for authentication and is removed when you log out or it expires.",
    ],
  },
  {
    heading: "Data storage and security",
    paragraphs: [
      "Your data is stored in our database, and uploaded files such as profile images and resumes are stored with a third-party media storage provider. Passwords are stored in hashed form. No online service can be completely secure, but we take reasonable steps to protect your information.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can update your profile information at any time from your profile page. To request that your account and data be deleted, please reach out through our Contact page.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The latest version will always be available on this page, with the date it was last updated.",
    ],
  },
];

const Privacy: React.FC = () => (
  <LegalPage
    title="Privacy Policy"
    updated="October 28, 2026"
    intro="This policy explains what information SypharConnect collects, how it is used, and the choices you have."
    sections={sections}
  />
);

export default Privacy;
