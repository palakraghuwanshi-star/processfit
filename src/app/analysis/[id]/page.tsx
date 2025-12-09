import { notFound, redirect } from "next/navigation";
import { getData } from "@/app/lib/data-store";
import { ScoreSummary } from "@/app/components/analysis/score-summary";
import { ScoreBreakdown } from "@/app/components/analysis/score-breakdown";
import { PriorityMatrix } from "@/app/components/analysis/priority-matrix";
import { KeyInsights } from "@/app/components/analysis/key-insights";
import { AiAnalysis } from "@/app/components/analysis/ai-analysis";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


export default function AnalysisPage({ params }: { params: { id: string } }) {
  const data = getData(params.id);

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
                <AiAnalysis analysisId={params.id} initialAiAnalysis={data.aiAnalysis} />
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
