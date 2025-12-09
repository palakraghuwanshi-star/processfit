import * as React from "react";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-headline font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
