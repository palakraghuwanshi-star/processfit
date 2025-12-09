import { Bot } from "lucide-react";
import { QuestionnaireForm } from "@/app/components/questionnaire/questionnaire-form";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4">
      <header className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full mb-4 border border-primary/20">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
          ProcessFit Analyzer
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Answer 20 questions to instantly analyze your business process for automation potential and get AI-driven recommendations.
        </p>
      </header>
      <main className="w-full max-w-3xl">
         <QuestionnaireForm />
      </main>
    </div>
  );
}
