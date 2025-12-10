
'use server';

import { redirect } from 'next/navigation';
import { analyzeProcess } from '@/ai/flows/analyze-process-with-ai';
import { getAssessment, updateAssessmentWithAiData } from '@/app/lib/data-store';
import type { AnalyzeProcessInput } from '@/ai/flows/analyze-process-with-ai';

// The submitQuestionnaire server action is no longer needed, as the form
// now handles submission on the client side directly to Firestore.

export async function getAiAnalysis(userId: string, analysisId: string) {
    const data = await getAssessment(userId, analysisId);
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
        await updateAssessmentWithAiData(userId, analysisId, aiResult);
        return { success: true, data: aiResult };
    } catch (error) {
        console.error("AI Analysis failed:", error);
        return { success: false, error: "Failed to get AI analysis. Please try again." };
    }
}
