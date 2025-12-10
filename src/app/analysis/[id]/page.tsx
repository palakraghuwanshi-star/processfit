
'use client';

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useUser } from "@/firebase";
import { getAssessment } from "@/app/lib/data-store";
import type { AnalysisResult } from "@/app/lib/data-store";
import { ScoreSummary } from "@/app/components/analysis/score-summary";
import { ScoreBreakdown } from "@/app/components/analysis/score-breakdown";
import { PriorityMatrix } from "@/app/components/analysis/priority-matrix";
import { KeyInsights } from "@/app/components/analysis/key-insights";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function AnalysisPage() {
  const { id: analysisId } = useParams() as { id: string };
  const { user, isUserLoading } = useUser();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      // Allow a brief moment for anon sign-in to complete
      const timer = setTimeout(() => {
        if (!user) {
          setError("You must be logged in to view this page.");
          setIsLoading(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (!analysisId) {
      notFound();
      return;
    }

    const fetchData = async () => {
      try {
        const assessmentData = await getAssessment(user.uid, analysisId);
        if (assessmentData) {
          setData(assessmentData);
        } else {
          setError("Analysis not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load analysis data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [user, isUserLoading, analysisId]);

  if (isLoading || isUserLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive">{error}</h1>
               <Button asChild variant="outline" className="mt-4">
                  <Link href="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Back
                  </Link>
              </Button>
          </div>
      </div>
    );
  }
  
  if (!data) {
    return notFound();
  }


  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start py-8 sm:py-12 px-4">
      <div className="w-full max-w-4xl bg-background rounded-lg border shadow-sm">
        <header className="p-6 sm:p-8 border-b">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        Analysis Results
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        For process: <span className="font-semibold text-primary">{data.formData.processName}</span>
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        New Analysis
                    </Link>
                </Button>
            </div>
        </header>

        <main className="p-6 sm:p-8 space-y-12">
            <ScoreSummary scores={data.scores} totalScore={150} />

            <Separator />
            
            <PriorityMatrix businessImpact={data.scores.businessImpact} feasibility={data.scores.feasibility} />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-3">
                    <ScoreBreakdown scores={data.scores} />
                </div>
                <div className="md:col-span-2">
                     <KeyInsights flags={data.flags} formData={data.formData} />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
