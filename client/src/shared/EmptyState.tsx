import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <svg
        viewBox="0 0 200 160"
        className="w-52 h-auto text-muted-foreground"
        fill="none"
        role="img"
        aria-label="No results illustration"
      >
        <ellipse cx="100" cy="146" rx="62" ry="7" fill="currentColor" opacity="0.12" />
        {/* briefcase */}
        <rect x="40" y="56" width="104" height="76" rx="10" stroke="currentColor" strokeWidth="4" />
        <path d="M74 56V46a8 8 0 0 1 8-8h40a8 8 0 0 1 8 8v10" stroke="currentColor" strokeWidth="4" />
        <path d="M40 90h104" stroke="currentColor" strokeWidth="4" />
        <rect x="86" y="84" width="12" height="12" rx="3" fill="currentColor" />
        {/* magnifier */}
        <circle cx="140" cy="102" r="26" className="fill-background" stroke="#ef4444" strokeWidth="5" />
        <path d="M130 92l20 20M150 92l-20 20" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
        <path d="M159 121l22 22" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
