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
  feasibility: number;
}

const quadrantConfig = {
    "QUICK WINS ⭐": "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400",
    "STRATEGIC LONG-TERM": "bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400",
    "INCREMENTAL GAINS": "bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-400",
    "AVOID/REVISIT": "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400",
}

export function PriorityMatrix({ businessImpact, feasibility }: PriorityMatrixProps) {
  const maxImpact = 120;
  const maxFeasibility = 30;

  const yPos = 100 - (businessImpact / maxImpact) * 100;
  const xPos = (feasibility / maxFeasibility) * 100;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Priority Matrix</CardTitle>
        <CardDescription>
          Your process plotted by impact vs. feasibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative aspect-square">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className={cn("flex items-center justify-center p-2 text-center text-sm font-semibold border-r border-b", quadrantConfig["STRATEGIC LONG-TERM"])}>Strategic Long-Term</div>
            <div className={cn("flex items-center justify-center p-2 text-center text-sm font-semibold border-b", quadrantConfig["QUICK WINS ⭐"])}>Quick Wins ⭐</div>
            <div className={cn("flex items-center justify-center p-2 text-center text-sm font-semibold border-r", quadrantConfig["AVOID/REVISIT"])}>Avoid / Revisit</div>
            <div className={cn("flex items-center justify-center p-2 text-center text-sm font-semibold", quadrantConfig["INCREMENTAL GAINS"])}>Incremental Gains</div>
        </div>

        <div
          className="absolute w-4 h-4 rounded-full bg-primary ring-4 ring-primary/30 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ top: `${yPos}%`, left: `${xPos}%` }}
          title={`Your Process (Impact: ${businessImpact}, Feasibility: ${feasibility})`}
        />

        <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold uppercase text-muted-foreground tracking-wider">Business Impact</div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold uppercase text-muted-foreground tracking-wider">Feasibility</div>
      </CardContent>
    </Card>
  );
}
