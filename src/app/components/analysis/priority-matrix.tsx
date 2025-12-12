
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PriorityMatrixProps {
  businessImpact: number;
  feasibility: number; // This will now be total feasibility (original + complexity)
}

const quadrantConfig = {
    "QUICK WINS ⭐": "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400",
    "STRATEGIC LONG-TERM": "bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400",
    "INCREMENTAL GAINS": "bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-400",
    "REVISIT": "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400",
}

export function PriorityMatrix({ businessImpact, feasibility }: PriorityMatrixProps) {
  const maxImpact = 120;
  const maxFeasibility = 60; // Now includes Task Complexity (30 + 30)

  const yPos = 100 - (businessImpact / maxImpact) * 100;
  const xPos = (feasibility / maxFeasibility) * 100;

  return (
    <section>
        <h2 className="text-2xl font-bold text-foreground">Priority Matrix</h2>
        <p className="text-muted-foreground mt-1">Your process plotted by its business impact vs. technical feasibility.</p>

        <div className="relative mt-6 aspect-video w-full max-w-2xl mx-auto">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-lg border">
                <div className="flex items-center justify-center p-4 text-center text-sm font-semibold border-r border-b bg-blue-500/5 text-blue-900 dark:text-blue-200">Strategic Long-Term</div>
                <div className="flex items-center justify-center p-4 text-center text-sm font-semibold border-b bg-green-500/5 text-green-900 dark:text-green-200">Quick Wins ⭐</div>
                <div className="flex items-center justify-center p-4 text-center text-sm font-semibold border-r bg-red-500/5 text-red-900 dark:text-red-200">Revisit</div>
                <div className="flex items-center justify-center p-4 text-center text-sm font-semibold bg-orange-500/5 text-orange-900 dark:text-orange-200">Incremental Gains</div>
            </div>

            <div
            className="absolute w-4 h-4 rounded-full bg-primary ring-4 ring-primary/30 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ top: `${yPos}%`, left: `${xPos}%` }}
            title={`Your Process (Impact: ${businessImpact}, Feasibility: ${feasibility})`}
            />

            <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold uppercase text-muted-foreground tracking-wider origin-center">Business Impact →</div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase text-muted-foreground tracking-wider">Feasibility →</div>
        </div>
    </section>
  );
}
