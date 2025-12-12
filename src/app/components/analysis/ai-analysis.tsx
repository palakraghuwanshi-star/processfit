'use client';

import type { AnalyzeProcessOutput } from '@/ai/flows/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Forward, Timer } from 'lucide-react';

interface AiAnalysisProps {
  analysis: AnalyzeProcessOutput;
}

const getCategoryVariant = (category?: string) => {
  if (!category) return 'outline';
  if (category.includes('QUICK WIN')) return 'default';
  if (category.includes('STRATEGIC')) return 'secondary';
  if (category.includes('INCREMENTAL')) return 'outline';
  return 'destructive';
};

export function AiAnalysis({ analysis }: AiAnalysisProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
                <Badge variant={getCategoryVariant(analysis.recommendation)} className="text-base">
                    {analysis.recommendation}
                </Badge>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confidence</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{analysis.confidence}%</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Est. Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{analysis.timelineEstimate}</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="font-semibold mb-3 flex items-center text-green-600 dark:text-green-500">
                <CheckCircle className="mr-2 h-5 w-5" />
                Top Strengths
            </h3>
            <ul className="space-y-2 text-sm text-foreground list-disc pl-5">
                {analysis.topStrengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                ))}
            </ul>
        </div>
        <div>
             <h3 className="font-semibold mb-3 flex items-center text-amber-600 dark:text-amber-500">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Top Concerns
            </h3>
            <ul className="space-y-2 text-sm text-foreground list-disc pl-5">
                {analysis.topConcerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                ))}
            </ul>
        </div>
      </div>
      
       <div>
            <h3 className="font-semibold mb-3 flex items-center text-primary">
                <Forward className="mr-2 h-5 w-5" />
                Suggested Next Steps
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.nextSteps}</p>
        </div>
    </div>
  );
}
