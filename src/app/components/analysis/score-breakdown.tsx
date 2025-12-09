"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisScores } from "@/app/lib/data-store";

interface ScoreBreakdownProps {
  scores: AnalysisScores;
}

const maxScores = {
    volumeScale: 20,
    costEfficiency: 30,
    riskCompliance: 30,
    feasibility: 30,
    strategicImpact: 40,
};

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const data = [
    { name: "Volume & Scale", score: scores.volumeScale, max: maxScores.volumeScale },
    { name: "Cost & Efficiency", score: scores.costEfficiency, max: maxScores.costEfficiency },
    { name: "Risk & Compliance", score: scores.riskCompliance, max: maxScores.riskCompliance },
    { name: "Feasibility", score: scores.feasibility, max: maxScores.feasibility },
    { name: "Strategic Impact", score: scores.strategicImpact, max: maxScores.strategicImpact },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Score Breakdown</CardTitle>
        <CardDescription>
          How your process scored in each key area.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={120}
            />
            <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Category
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                        {payload[0].payload.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Score
                                    </span>
                                    <span className="font-bold">
                                        {payload[0].value} / {payload[0].payload.max}
                                    </span>
                                </div>
                            </div>
                        </div>
                        )
                    }
                    return null
                }}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
