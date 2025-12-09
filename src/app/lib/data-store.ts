import type { FormValues } from '@/app/lib/schema';
import type { AnalyzeProcessOutput } from '@/ai/flows/analyze-process-with-ai';

export type AnalysisScores = {
    volumeScale: number;
    costEfficiency: number;
    riskCompliance: number;
    feasibility: number;
    strategicImpact: number;
    businessImpact: number;
    totalScore: number;
    category: string;
    color: string;
};

export type AnalysisResult = {
    id: string;
    submittedAt: Date;
    formData: FormValues;
    scores: AnalysisScores;
    flags: string[];
    aiAnalysis?: AnalyzeProcessOutput;
};

const analysisStore = new Map<string, AnalysisResult>();

export const saveData = (id: string, data: AnalysisResult) => {
    analysisStore.set(id, data);
};

export const getData = (id: string): AnalysisResult | undefined => {
    return analysisStore.get(id);
};

export const updateWithAiData = (id: string, aiAnalysis: AnalyzeProcessOutput) => {
    const existingData = analysisStore.get(id);
    if (existingData) {
        analysisStore.set(id, { ...existingData, aiAnalysis });
    }
};
