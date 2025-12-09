import { QuestionnaireForm } from "@/app/components/questionnaire/questionnaire-form";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4">
      <header className="flex flex-col items-center text-center mb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-semibold text-foreground">
          New Process Assessment
        </h1>
        <p className="mt-2 text-md text-muted-foreground max-w-xl">
          Complete this form to initiate an AI-powered qualification analysis for a new integration process.
        </p>
      </header>
      <main className="w-full max-w-4xl">
         <QuestionnaireForm />
      </main>
    </div>
  );
}
