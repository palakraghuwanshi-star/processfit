
import { QuestionnaireForm } from "@/app/components/questionnaire/questionnaire-form";
import { Header } from "../components/header";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pb-16">
      <Header />
      <main className="w-full max-w-4xl px-4 mt-10">
        <div className="text-center mb-10">
            <h1 className="font-bold text-3xl md:text-4xl text-foreground">
            New Process Assessment
            </h1>
            <p className="mt-2 text-md text-muted-foreground max-w-xl mx-auto">
            Complete this form to initiate an AI-powered qualification analysis for a new integration process.
            </p>
        </div>
        <div className="p-6 sm:p-8 border rounded-lg bg-card shadow-sm">
            <QuestionnaireForm />
        </div>
      </main>
    </div>
  );
}
