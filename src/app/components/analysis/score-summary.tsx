"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisScores } from "@/app/lib/data-store";

const categoryPriority: Record<string, { priority: string; variant: "default" | "secondary" | "destructive" | "outline"}> = {
    "QUICK WIN ⭐": { priority: "Highest", variant: "default"},
    "STRATEGIC LONG-TERM": { priority: "High", variant: "secondary"},
    "INCREMENTAL GAINS": { priority: "Medium", variant: "outline" },
    "AVOID/REVISIT": { priority: "Low", variant: "destructive"},
}

const categoryColors: Record<string, string> = {
    "green": "bg-green-500",
    "yellow": "bg-yellow-500",
    "orange": "bg-orange-500",
    "red": "bg-red-500",
}

interface ScoreSummaryProps {
  scores: AnalysisScores;
  totalScore: number;
}

export function ScoreSummary({ scores, totalScore }: ScoreSummaryProps) {
  const percentage = Math.round((scores.totalScore / totalScore) * 100);
  const priorityInfo = categoryPriority[scores.category] || { priority: 'N/A', variant: 'secondary' };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Score Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <p className="text-4xl font-bold text-primary">{scores.totalScore}</p>
            <p className="text-sm text-muted-foreground">Total Score (/{totalScore})</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <p className="text-4xl font-bold text-primary">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Overall Fit</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${categoryColors[scores.color]}`}></div>
                <p className="text-xl font-semibold">{scores.category}</p>
            </div>
            <p className="text-sm text-muted-foreground">Category</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <Badge variant={priorityInfo.variant} className="text-lg">{priorityInfo.priority}</Badge>
            <p className="text-sm text-muted-foreground mt-2">Priority</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
