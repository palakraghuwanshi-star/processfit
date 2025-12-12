
'use client';

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { useUser } from "@/firebase";
import { getAssessment, updateAssessmentWithAiData, type AnalysisResult } from "@/app/lib/data-store";
import { ScoreSummary } from "@/app/components/analysis/score-summary";
import { ScoreBreakdown } from "@/app/components/analysis/score-breakdown";
import { PriorityMatrix } from "@/app/components/analysis/priority-matrix";
import { KeyInsights } from "@/app/components/analysis/key-insights";
import { FullResponses } from "@/app/components/analysis/full-responses";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/app/components/header";
import { Progress } from "@/components/ui/progress";
import { analyzeProcess } from "@/ai/flows/analyze-process-with-ai";
import type { AnalyzeProcessOutput } from "@/ai/flows/types";
import { AiAnalysis } from "@/app/components/analysis/ai-analysis";

export default function AnalysisPage() {
  const { id: analysisId } = useParams() as { id: string };
  const { user, isUserLoading } = useUser();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<AnalyzeProcessOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 2000); // Update every 2 seconds to reach ~100% in 40 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
        const idTokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!idTokenResult.claims.isAdmin);
        setIsAuthCheckComplete(true);
        
        const assessmentData = await getAssessment(user.uid, analysisId);
        if (assessmentData) {
          setData(assessmentData);
          if (assessmentData.aiAnalysis) {
              setAiAnalysis(assessmentData.aiAnalysis);
              setIsAiLoading(false);
          } else {
              // Kick off AI analysis if it doesn't exist
              const analysis = await analyzeProcess({
                  formSnapshot: assessmentData.formData,
                  scores: assessmentData.scores
              });
              setAiAnalysis(analysis);
              // Save it back to DB - non-blocking
              updateAssessmentWithAiData(user.uid, analysisId, analysis);
              setIsAiLoading(false);
          }
        } else {
          setError("Analysis not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load analysis data.");
      } finally {
        setIsLoading(false);
        setProgress(100);
      }
    };

    fetchData();

  }, [user, isUserLoading, analysisId]);

  if (isLoading || isUserLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="w-full max-w-md text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h1 className="text-2xl font-semibold mt-4">Running Analysis...</h1>
                <p className="text-muted-foreground mt-2">
                    Please wait, this can take up to 40 seconds.
                </p>
                <Progress value={progress} className="w-full mt-4" />
            </div>
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
  
  if (!data || !data.scores) {
    return notFound();
  }


  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start pb-16">
      <Header />
      <div className="w-full max-w-4xl bg-background rounded-lg border shadow-sm mt-8">
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
                {isAuthCheckComplete && (
                  <Button asChild variant="outline">
                      <Link href={isAdmin ? "/admin/dashboard" : "/assessment"}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {isAdmin ? "Back to Dashboard" : "New Analysis"}
                      </Link>
                  </Button>
                )}
            </div>
        </header>

        <main className="p-6 sm:p-8 space-y-12">
            <ScoreSummary scores={data.scores} totalScore={150} />
            
            <Separator />
             <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    AI-Powered Analysis & Recommendations
                </h2>
                {isAiLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating AI insights...</span>
                    </div>
                ) : aiAnalysis ? (
                    <AiAnalysis analysis={aiAnalysis} />
                ) : (
                    <p className="text-muted-foreground">Could not generate AI analysis.</p>
                )}
            </div>

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
            {(isAdmin || (user && !user.isAnonymous)) && (
                <>
                    <Separator />
                    <FullResponses formData={data.formData} />
                </>
            )}
        </main>
      </div>
    </div>
  );
}
