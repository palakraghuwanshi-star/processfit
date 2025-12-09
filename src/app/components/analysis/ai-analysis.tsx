"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAiAnalysis } from "@/app/actions";
import { Bot, CheckCircle2, Clock, ListChecks, ThumbsDown, ThumbsUp, Wand2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeProcessOutput } from "@/ai/flows/analyze-process-with-ai";

interface AiAnalysisProps {
  analysisId: string;
  initialAiAnalysis?: AnalyzeProcessOutput;
}

export function AiAnalysis({ analysisId, initialAiAnalysis }: AiAnalysisProps) {
  const [analysis, setAnalysis] = React.useState<AnalyzeProcessOutput | undefined>(initialAiAnalysis);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAiAnalysis(analysisId);
      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError(result.error || "An unknown error occurred.");
        toast({
          variant: "destructive",
          title: "AI Analysis Failed",
          description: result.error || "Please try again later.",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
       toast({
          variant: "destructive",
          title: "AI Analysis Failed",
          description: errorMessage,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot className="text-primary"/> AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Get a detailed automation strategy from our AI consultant.
          </CardDescription>
        </div>
        {!analysis && !isLoading && (
            <Button onClick={handleAnalysis} disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" /> Analyze with AI
            </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={handleAnalysis} />}
        {analysis && <AnalysisContent analysis={analysis} />}
      </CardContent>
    </Card>
  );
}

const LoadingState = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-5 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
)

const ErrorState = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="text-center py-8">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h3 className="mt-4 text-lg font-medium">Analysis Failed</h3>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <Button onClick={onRetry} variant="secondary" className="mt-4">
            Retry Analysis
        </Button>
    </div>
);

const AnalysisContent = ({ analysis }: { analysis: AnalyzeProcessOutput }) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><CheckCircle2 className="text-accent-foreground"/> Recommendation</h3>
            <p className="text-primary font-bold text-xl">{analysis.recommendation} <span className="text-sm font-normal text-muted-foreground">({analysis.confidence}% confidence)</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><ThumbsUp className="text-green-500" /> Strengths</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                    {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-lg flex items-center gap-2"><ThumbsDown className="text-orange-500" /> Concerns</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                    {analysis.concerns.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
            </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><Clock className="text-muted-foreground"/> Timeline Estimate</h3>
            <p className="text-md">{analysis.timelineEstimate}</p>
        </div>
        <div>
            <h3 className="font-semibold text-lg flex items-center gap-2"><ListChecks className="text-muted-foreground"/> Next Steps</h3>
            <p className="text-sm whitespace-pre-line">{analysis.nextSteps}</p>
        </div>
    </div>
)
