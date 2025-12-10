
'use client';

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { getAssessment } from "@/app/lib/data-store";
import type { AnalysisResult } from "@/app/lib/data-store";
import { ScoreSummary } from "@/app/components/analysis/score-summary";
import { ScoreBreakdown } from "@/app/components/analysis/score-breakdown";
import { PriorityMatrix } from "@/app/components/analysis/priority-matrix";
import { KeyInsights } from "@/app/components/analysis/key-insights";
import { AiAnalysis } from "@/app/components/analysis/ai-analysis";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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
      setError("You must be logged in to view this page.");
      setIsLoading(false);
      return;
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
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start py-8 sm:py-12 px-4">
      <div className="w-full max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                    Analysis Results
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <ScoreSummary scores={data.scores} totalScore={150} />
            </div>

            <div className="lg:col-span-2 grid gap-6">
                <AiAnalysis userId={user.uid} analysisId={analysisId} initialAiAnalysis={data.aiAnalysis} />
                <ScoreBreakdown scores={data.scores} />
            </div>

            <div className="grid gap-6">
                <PriorityMatrix businessImpact={data.scores.businessImpact} feasibility={data.scores.feasibility} />
                <KeyInsights flags={data.flags} formData={data.formData} />
            </div>
        </div>
      </div>
    </div>
  );
}
