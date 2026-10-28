import React from "react";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const LegalPage: React.FC<LegalPageProps> = ({
  title,
  updated,
  intro,
  sections,
}) => {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <header className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold lg:text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        <p className="text-muted-foreground">{intro}</p>
      </header>

      <div className="space-y-8">
        {sections.map(({ heading, paragraphs }) => (
          <section key={heading} className="space-y-3">
            <h2 className="text-xl font-medium">{heading}</h2>
            {paragraphs.map((text) => (
              <p key={text} className="text-muted-foreground leading-relaxed">
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
};

export default LegalPage;
