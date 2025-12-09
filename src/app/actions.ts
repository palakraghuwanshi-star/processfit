'use server';

import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import { analyzeProcess } from '@/ai/flows/analyze-process-with-ai';
import { formSchema, type FormValues } from '@/app/lib/schema';
import { calculateScores } from '@/app/lib/scoring';
import { saveData, getData, updateWithAiData } from '@/app/lib/data-store';
import type { AnalyzeProcessInput } from '@/ai/flows/analyze-process-with-ai';

export async function submitQuestionnaire(values: FormValues) {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
        // This should ideally not happen with client-side validation, but serves as a safeguard.
        throw new Error("Invalid form data submitted.");
    }

    const id = randomUUID();
    const { scores, flags } = calculateScores(validatedFields.data);

    saveData(id, {
        id,
        submittedAt: new Date(),
        formData: validatedFields.data,
        scores,
        flags,
    });
    
    redirect(`/analysis/${id}`);
}


export async function getAiAnalysis(analysisId: string) {
    const data = getData(analysisId);
    if (!data) {
        throw new Error("Analysis not found.");
    }
    if (data.aiAnalysis) {
        return { success: true, data: data.aiAnalysis };
    }

    const { formData, scores, flags } = data;

    const aiInput: AnalyzeProcessInput = {
        processName: formData.processName,
        industry: formData.industry,
        responses: {
            monthlyVolume: formData.monthlyVolume,
            frequency: formData.processFrequency,
            teamSize: formData.teamSize,
            timePercentage: formData.timePercentage,
            processingTime: formData.averageProcessingTime,
            monthlyCost: formData.costPerTransaction * formData.monthlyVolume,
            errorRate: formData.errorRate,
            compliance: formData.complianceRequirements,
            delayImpact: formData.impactOfDelays,
            standardization: formData.processStandardization,
            sopStatus: formData.documentationStatus,
            exceptionRate: formData.exceptionHandling,
            systems: formData.systems.map(s => ({
                name: s.name,
                hasAPI: s.hasApi === "Yes",
            })),
            systemAccess: formData.systemAccess,
            bottleneck: formData.processBottleneck,
            complaints: formData.stakeholderComplaints,
            growthLimit: formData.growthLimitation,
            roiTimeline: formData.expectedROI,
            biggestPainPoint: formData.biggestPainPoint || "Not provided.",
            currentChallenges: formData.currentChallenges || [],
        },
        scores: {
            volumeScale: scores.volumeScale,
            costEfficiency: scores.costEfficiency,
            riskCompliance: scores.riskCompliance,
            feasibility: scores.feasibility,
            strategicImpact: scores.strategicImpact,
            businessImpact: scores.businessImpact,
            totalScore: scores.totalScore,
            category: scores.category.replace(' ⭐', ''),
        },
        flags: flags,
    };
    
    try {
        const aiResult = await analyzeProcess(aiInput);
        updateWithAiData(analysisId, aiResult);
        return { success: true, data: aiResult };
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return { success: false, error: "Failed to get AI analysis. Please try again." };
    }
}
