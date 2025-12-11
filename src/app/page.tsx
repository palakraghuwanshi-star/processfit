
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Header } from "./components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Discover Your Automation Potential with{" "}
            <span className="text-primary">ProcessFit Analyser</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Uncover inefficiencies and quantify the automation readiness of any
            business process. Get an instant, data-driven analysis to guide
            your digital transformation journey.
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link href="/assessment">
                Start Your Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pace's ProcessFit Analyser. All rights reserved.
      </footer>
    </div>
  );
}
