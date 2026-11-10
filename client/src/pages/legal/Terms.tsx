import React from "react";
import LegalPage, { type LegalSection } from "./LegalPage";

const sections: LegalSection[] = [
  {
    heading: "Using SypharConnect",
    paragraphs: [
      "SypharConnect connects job seekers with recruiters. By creating an account or using the platform you agree to these terms.",
      "You must provide accurate information and keep your login details confidential. You are responsible for activity that happens under your account.",
    ],
  },
  {
    heading: "Job seekers",
    paragraphs: [
      "You agree that the information in your profile and applications is true and that you have the right to share it, including any resume you upload.",
    ],
  },
  {
    heading: "Recruiters",
    paragraphs: [
      "You agree to post only genuine job openings, to describe roles and companies accurately, and to use applicant information solely for hiring purposes.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "You may not post unlawful, misleading or discriminatory content, impersonate others, attempt to access accounts or data that are not yours, or interfere with the operation of the platform.",
    ],
  },
  {
    heading: "Content you submit",
    paragraphs: [
      "You keep ownership of the content you submit. By submitting it you allow us to display it on the platform so that the service can work, for example showing your application to the recruiter.",
    ],
  },
  {
    heading: "No guarantee of employment",
    paragraphs: [
      "SypharConnect is a platform that connects the two sides. We do not guarantee that any application will lead to an interview or job offer, and we are not a party to any employment agreement.",
    ],
  },
  {
    heading: "Suspension and termination",
    paragraphs: [
      "We may suspend or remove accounts or content that break these terms. You can stop using the platform at any time.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. Continuing to use the platform after a change means you accept the updated terms.",
    ],
  },
];

const Terms: React.FC = () => (
  <LegalPage
    title="Terms of Service"
    updated="October 28, 2026"
    intro="Please read these terms carefully before using SypharConnect."
    sections={sections}
  />
);

export default Terms;
