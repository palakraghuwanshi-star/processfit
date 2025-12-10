import type { FormValues } from '@/app/lib/schema';
import type { AnalysisScores } from '@/app/lib/data-store';

const scoreMonthlyVolume = (volume: number): number => {
    if (volume < 100) return 0;
    if (volume <= 500) return 2;
    if (volume <= 1000) return 4;
    if (volume <= 2500) return 6;
    if (volume <= 5000) return 8;
    return 10;
};

const scoreProcessFrequency = (frequency: string): number => {
    switch (frequency) {
        case "Annually or quarterly": return 2;
        case "Monthly": return 4;
        case "Weekly": return 6;
        case "Daily": return 8;
        case "Continuous (multiple times per day)": return 10;
        default: return 0;
    }
};

const scoreTeamEffort = (people: number, percentage: number): number => {
    const fteHours = people * (percentage / 100) * 160;
    if (fteHours < 40) return 0;
    if (fteHours <= 80) return 2;
    if (fteHours <= 120) return 4;
    if (fteHours <= 160) return 6;
    if (fteHours <= 200) return 8;
    return 10;
};

const scoreProcessingTime = (time: string): number => {
    switch (time) {
        case "Less than 1 day": return 2;
        case "1-2 days": return 4;
        case "3-5 days": return 6;
        case "6-10 days": return 8;
        case "11-15 days": return 9;
        case "More than 15 days": return 10;
        default: return 0;
    }
};

const scoreCostPerTransaction = (cost: number): number => {
    if (cost < 5) return 1;
    if (cost <= 10) return 3;
    if (cost <= 25) return 5;
    if (cost <= 50) return 7;
    if (cost <= 100) return 9;
    return 10;
};

const scoreErrorRate = (rate: number): number => {
    if (rate < 1) return 1;
    if (rate <= 2) return 2;
    if (rate <= 5) return 4;
    if (rate <= 10) return 6;
    if (rate <= 15) return 8;
    if (rate <= 20) return 9;
    return 10;
};

const scoreCompliance = (reqs: string[]): number => {
    if (reqs.includes("Multiple high-level regulatory requirements")) return 10;
    if (reqs.includes("Government regulations (SOX, FDA, GDPR, etc.)")) return 8;
    if (reqs.includes("Industry standards (ISO, etc.)")) return 6;
    if (reqs.includes("Internal audit only")) return 4;
    if (reqs.includes("None")) return 2;
    return 0;
};

const scoreDelayImpact = (impact: string | undefined): number => {
    if (!impact) return 0;
    switch (impact) {
        case "Minimal impact, no direct costs": return 1;
        case "Some operational inconvenience": return 3;
        case "Significant cash flow impact": return 5;
        case "Financial penalties or late fees": return 7;
        case "Major penalties and/or vendor relationship damage": return 10;
        default: return 0;
    }
};

const scoreStandardization = (percentage: number): number => {
    if (percentage < 30) return 1;
    if (percentage <= 50) return 3;
    if (percentage <= 70) return 5;
    if (percentage <= 80) return 7;
    if (percentage <= 90) return 9;
    return 10;
};

const scoreDocumentation = (status: string): number => {
    switch (status) {
        case "No documentation exists": return 0;
        case "Partially documented": return 3;
        case "Documented but outdated": return 5;
        case "Fully documented and current": return 10;
        default: return 0;
    }
};

const scoreExceptionRate = (rate: number): number => {
    if (rate < 5) return 10;
    if (rate <= 10) return 8;
    if (rate <= 15) return 6;
    if (rate <= 20) return 4;
    if (rate <= 30) return 2;
    return 0;
};

const scoreBottleneck = (bottleneck: string): number => {
    switch (bottleneck) {
        case "No, it operates independently": return 2;
        case "Minimal impact on other processes": return 4;
        case "Moderate delays to downstream processes": return 7;
        case "Significant blocker for multiple processes": return 10;
        default: return 0;
    }
};

const scoreComplaints = (complaints: string): number => {
    switch (complaints) {
        case "Rarely or never": return 1;
        case "Occasionally (few per quarter)": return 4;
        case "Regularly (monthly)": return 7;
        case "Frequently (weekly or daily)": return 10;
        default: return 0;
    }
};

const scoreGrowthLimitation = (growth: string): number => {
    switch (growth) {
        case "No constraints": return 2;
        case "Minor constraints": return 4;
        case "Moderate constraints, would need significant hiring to scale": return 7;
        case "Major constraints, actively limiting growth": return 10;
        default: return 0;
    }
};

const scoreROI = (roi: string): number => {
    switch (roi) {
        case "More than 3 years": return 2;
        case "2-3 years": return 4;
        case "18-24 months": return 5;
        case "12-18 months": return 7;
        case "6-12 months": return 9;
        case "Less than 6 months": return 10;
        default: return 0;
    }
};

export const calculateScores = (data: FormValues): { scores: AnalysisScores, flags: string[] } => {
    const flags: string[] = [];

    const volumeScale = scoreMonthlyVolume(data.monthlyVolume) + scoreProcessFrequency(data.processFrequency);
    const costEfficiency = scoreTeamEffort(data.teamSize, data.timePercentage) + scoreProcessingTime(data.averageProcessingTime) + scoreCostPerTransaction(data.costPerTransaction);
    const riskCompliance = scoreErrorRate(data.errorRate) + scoreCompliance(data.complianceRequirements) + scoreDelayImpact(data.impactOfDelays);
    
    let stdScore = scoreStandardization(data.processStandardization);
    const docScore = scoreDocumentation(data.documentationStatus);
    const excScore = scoreExceptionRate(data.exceptionHandling);

    let apiScore = 0;
    if (data.systems.every(s => s.hasApi === "Yes")) {
        apiScore = 10;
    } else if (data.systems.some(s => s.hasApi === "No" || s.hasApi === "Don't know")) {
        apiScore = 4; // Penalize for any "No" or "Don't know"
    } else {
        apiScore = 6; // Mixed
    }
    
    let accessScore = 0;
    switch (data.systemAccess) {
        case "All systems are cloud-based and accessible externally": accessScore = 10; break;
        case "Most systems require VPN but are accessible remotely": accessScore = 8; break;
        case "Some systems are on internal network only": accessScore = 5; break;
        case "All systems are internal/intranet only": accessScore = 2; break;
    }

    if (data.documentationStatus === "No documentation exists" || data.documentationStatus === "Partially documented") {
        flags.push("⚠️ No or partial documented SOPs");
    }
    if (data.exceptionHandling > 30) {
        flags.push(`⚠️ High exception rate (>30%)`);
        stdScore -= 4;
    }
    
    data.systems.forEach(sys => {
        if(sys.hasApi === 'No' && sys.isCloud === 'No') {
            flags.push(`❌ Integration blocker: ${sys.name} is not cloud-based and has no API`);
        } else if (sys.hasApi === 'No') {
            flags.push(`⚠️ System without API: ${sys.name}`);
        } else if (sys.hasApi === "Don't know") {
            flags.push(`❓ API status unknown for ${sys.name}. Further investigation needed.`);
        }
    });
    if (data.systemAccess === "All systems are internal/intranet only") {
        flags.push("❌ Integration blocker: All systems are on internal network only");
    }

    let feasibilityPenalty = 0;
    if (data.documentationStatus === "No documentation exists" || data.documentationStatus === "Partially documented") {
        feasibilityPenalty = 3;
    }
    const rawFeasibility = Math.max(0, stdScore) + docScore + excScore + apiScore + accessScore;
    let feasibility = (rawFeasibility / 50) * 30 - feasibilityPenalty;
    feasibility = Math.max(0, Math.round(feasibility));

    const strategicImpact = scoreBottleneck(data.processBottleneck) + scoreComplaints(data.stakeholderComplaints) + scoreGrowthLimitation(data.growthLimitation) + scoreROI(data.expectedROI);

    const businessImpact = volumeScale + costEfficiency + riskCompliance + strategicImpact;
    const totalScore = businessImpact + feasibility;

    let category = "";
    let color = "";
    if (businessImpact >= 90 && feasibility >= 25) {
        category = "QUICK WIN ⭐";
        color = "green";
    } else if (businessImpact >= 90 && feasibility < 25) {
        category = "STRATEGIC LONG-TERM";
        color = "blue";
    } else if (businessImpact < 90 && feasibility >= 25) {
        category = "INCREMENTAL GAINS";
        color = "orange";
    } else {
        category = "AVOID/REVISIT";
        color = "red";
    }
    
    return {
        scores: {
            volumeScale, costEfficiency, riskCompliance, feasibility, strategicImpact,
            businessImpact: Math.round(businessImpact),
            totalScore: Math.round(totalScore),
            category, color,
        },
        flags
    };
};
