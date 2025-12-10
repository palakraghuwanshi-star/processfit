import { QuestionnaireForm } from "@/app/components/questionnaire/questionnaire-form";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4">
      <header className="w-full max-w-4xl flex items-center justify-between mb-10">
        <div className="flex flex-col">
            <h1 className="font-headline text-3xl md:text-4xl font-semibold text-foreground">
            New Process Assessment
            </h1>
            <p className="mt-2 text-md text-muted-foreground max-w-xl">
            Complete this form to initiate an AI-powered qualification analysis for a new integration process.
            </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/admin/login">
                <LogIn className="mr-2 h-4 w-4" />
                Admin Login
            </Link>
        </Button>
      </header>
      <main className="w-full max-w-4xl">
         <QuestionnaireForm />
      </main>
    </div>
  );
}
