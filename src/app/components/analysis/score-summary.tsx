"use client";

import type { AnalysisScores } from "@/app/lib/data-store";

const categoryInfo: Record<string, { priority: string; description: string }> = {
    "QUICK WIN ⭐": { priority: "Highest Priority", description: "High impact, high feasibility. These are prime candidates for automation." },
    "STRATEGIC LONG-TERM": { priority: "High Priority", description: "High impact, but lower feasibility. Requires strategic planning and investment." },
    "INCREMENTAL GAINS": { priority: "Medium Priority", description: "Lower impact, but high feasibility. Good for quick, smaller improvements." },
    "AVOID/REVISIT": { priority: "Low Priority", description: "Low impact and low feasibility. Best to avoid or revisit after other priorities." },
}

interface ScoreSummaryProps {
  scores: AnalysisScores;
  totalScore: number;
}

export function ScoreSummary({ scores, totalScore }: ScoreSummaryProps) {
  const percentage = Math.round((scores.totalScore / totalScore) * 100);
  const priorityInfo = categoryInfo[scores.category] || { priority: 'N/A', description: 'Category not determined' };

  return (
    <section>
        <h2 className="text-2xl font-bold text-foreground">Overall Assessment</h2>
        <p className="text-muted-foreground mt-1">A high-level summary of the automation potential.</p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <p className="text-4xl font-bold text-primary">{scores.totalScore}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Score (out of {totalScore})</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <p className="text-4xl font-bold text-primary">{percentage}%</p>
            <p className="text-sm text-muted-foreground mt-1">Overall Fit</p>
          </div>
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-semibold text-foreground">{scores.category}</p>
            <p className="text-sm text-muted-foreground mt-1">{priorityInfo.description}</p>
          </div>
        </div>
    </section>
  );
}
