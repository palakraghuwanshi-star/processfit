
'use client';

import type { FormValues } from '@/app/lib/schema';
import type { AnalysisScores } from '@/app/lib/data-store';
import scoringRules from './scoring-rules.json';

// --- Generic Rule Engine ---

type Rule = {
    criteria: string;
    score: string;
};

/**
 * Parses a numeric value from a rule's score string (e.g., "10 pts" -> 10).
 */
const parseScore = (score: string): number => {
    return parseInt(score.split(' ')[0], 10) || 0;
};

/**
 * Evaluates a numeric value against a single rule's criteria string.
 * Supports operators like <, <=, >, >=, and ranges like "500-1000".
 * Also supports monetary values like "$500-$1000".
 */
const evaluateNumericRule = (value: number, criteria: string): boolean => {
    const cleanedCriteria = criteria.replace(/\$/g, '');
    
    const matchRange = cleanedCriteria.match(/(\d+)-(\d+)/);
    if (matchRange) {
        const [, min, max] = matchRange.map(Number);
        return value >= min && value <= max;
    }

    const matchOperator = cleanedCriteria.match(/(<|<=|>|>=)\s*(\d+)/);
    if (matchOperator) {
        const [, operator, ruleValueStr] = matchOperator;
        const ruleValue = Number(ruleValueStr);
        switch (operator) {
            case '<': return value < ruleValue;
            case '<=': return value <= ruleValue;
            case '>': return value > ruleValue;
            case '>=': return value >= ruleValue;
        }
    }
    return false;
};

/**
 * Finds the matching rule for a given value from a set of rules and returns its score.
 */
const getScoreFromNumericRules = (value: number, rules: Rule[]): number => {
    // Find the first rule that matches the value.
    const rule = rules.find(r => evaluateNumericRule(value, r.criteria));
    return rule ? parseScore(rule.score) : 0;
};

/**
 * Finds the matching rule for a given string value and returns its score.
 */
const getScoreFromStringRule = (value: string, rules: Rule[]): number => {
    const rule = rules.find(r => r.criteria.toLowerCase().includes(value.toLowerCase()));
    return rule ? parseScore(rule.score) : 0;
};

// --- Dynamic Scoring Logic ---

/**
 * Dynamically calculates scores based on the rules defined in scoring-rules.json.
 */
export const calculateScores = (data: FormValues): { scores: AnalysisScores, flags: string[] } => {
    const flags: string[] = [];
    const categories = scoringRules.scoringCategories;

    // --- Helper to get rules for a specific category ---
    const getRules = (title: string): Rule[] => {
        return categories.find(c => c.title.startsWith(title))?.rules || [];
    };
    
    // --- Calculate Scores from Rules ---

    // Cost & Efficiency
    const costEfficiencyRules = getRules("Cost & Efficiency");
    const totalMonthlyValue = data.monthlyVolume * data.costPerTransaction;
    const fteHours = data.teamSize * (data.timePercentage / 100) * 160;
    const costEfficiency = 
        getScoreFromNumericRules(totalMonthlyValue, costEfficiencyRules) +
        getScoreFromNumericRules(fteHours, costEfficiencyRules) +
        getScoreFromStringRule(data.averageProcessingTime, costEfficiencyRules);

    // Volume & Scale (This category was missing from the original implementation)
    const volumeScale = getScoreFromStringRule(data.processFrequency, getRules("Volume & Scale") || costEfficiencyRules);

    // Risk & Compliance
    const riskRules = getRules("Risk & Compliance");
    const riskCompliance = 
        getScoreFromNumericRules(data.errorRate, riskRules) +
        getScoreFromStringRule(data.complianceRequirements[0] || "None", riskRules) +
        getScoreFromStringRule(data.impactOfDelays || "Minimal", riskRules);

    // Feasibility
    const feasibilityRules = getRules("Feasibility");
    const stdScore = getScoreFromNumericRules(data.processStandardization, feasibilityRules);
    const docScore = getScoreFromStringRule(data.documentationStatus, feasibilityRules);
    const excScore = getScoreFromNumericRules(data.exceptionHandling, feasibilityRules);

    let apiScore: number;
    const apiRules = feasibilityRules.filter(r => r.criteria.includes("API Access"));
    if (data.systems.every(s => s.hasApi === "Yes")) {
        apiScore = getScoreFromStringRule("All systems have APIs", apiRules);
    } else if (data.systems.some(s => s.hasApi === "No" || s.hasApi === "Don't know")) {
        apiScore = getScoreFromStringRule("Any \"No\" or \"Don't know\"", apiRules);
    } else {
        apiScore = getScoreFromStringRule("Mixed", apiRules);
    }
    
    const accessScore = getScoreFromStringRule(data.systemAccess, feasibilityRules);
    
    const rawFeasibility = Math.max(0, stdScore) + docScore + excScore + apiScore + accessScore;
    let feasibility = (rawFeasibility / 50) * 30; // Scale to 30 points

    // Task Complexity
    const complexityRules = getRules("Task Complexity");
    const docProcessingScore = getScoreFromStringRule(data.documentProcessing || 'No documents involved', complexityRules);
    const humanInLoopScore = getScoreFromStringRule(data.humanInLoop, complexityRules);

    const commNeeds = data.communicationNeeds || [];
    let communicationScore: number | null = null;
    if (commNeeds.length === 0 || commNeeds.includes('None of the above')) {
        communicationScore = 10;
    } else if (commNeeds.length === 1) {
        communicationScore = getScoreFromStringRule("1 Type", complexityRules);
    } else if (commNeeds.length === 2) {
        communicationScore = getScoreFromStringRule("2 Types", complexityRules);
    } else {
        communicationScore = getScoreFromStringRule("3+ Types", complexityRules);
    }
    
    const complexityScores = [docProcessingScore, humanInLoopScore, communicationScore].filter(s => s !== null) as number[];
    const averageComplexityScore = complexityScores.length > 0
        ? complexityScores.reduce((acc, score) => acc + score, 0) / complexityScores.length
        : 10;
    const taskComplexityScore = Math.round((averageComplexityScore / 10) * 30); // Scale to 30 points


    // --- Flags and Penalties ---
    if (data.documentationStatus === "No documentation exists" || data.documentationStatus === "Partially documented") {
        flags.push("⚠️ No or partial documented SOPs");
    }
    if (data.exceptionHandling > 30) {
        flags.push(`⚠️ High exception rate (>30%)`);
    }
    data.systems.forEach(sys => {
        if (sys.hasApi === 'No' && sys.isCloud === 'No') {
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

    // --- Strategic Impact ---
    const strategicRules = getRules("Strategic Impact");
    const strategicImpact = 
        getScoreFromStringRule(data.processBottleneck, strategicRules) +
        getScoreFromStringRule(data.stakeholderComplaints, strategicRules) +
        getScoreFromStringRule(data.growthLimitation, strategicRules) +
        getScoreFromStringRule(data.expectedROI, strategicRules);

    // --- Final Calculations ---
    const businessImpact = volumeScale + costEfficiency + riskCompliance + strategicImpact;
    const totalFeasibility = Math.round(feasibility) + taskComplexityScore;
    const totalScore = businessImpact + totalFeasibility;

    let category = "REVISIT";
    let color = "red";
    const categorizationRules = getRules("Process Categorization");

    for (const rule of categorizationRules) {
        const criteria = rule.criteria.replace(/\s/g, ''); // Remove spaces
        const impactMatch = criteria.match(/BusinessImpact(>=|<)(\d+)/);
        const feasibilityMatch = criteria.match(/TotalFeasibility(>=|<)(\d+)/);

        if (impactMatch && feasibilityMatch) {
            const [, impactOp, impactValStr] = impactMatch;
            const [, feasyOp, feasyValStr] = feasibilityMatch;
            const impactVal = Number(impactValStr);
            const feasyVal = Number(feasyValStr);

            const isImpactMet = impactOp === '>=' ? businessImpact >= impactVal : businessImpact < impactVal;
            const isFeasibilityMet = feasyOp === '>=' ? totalFeasibility >= feasyVal : totalFeasibility < feasyVal;

            if (isImpactMet && isFeasibilityMet) {
                category = rule.score;
                break;
            }
        }
    }
    
    // Assign color based on category
    if (category.includes("QUICK WIN")) color = "green";
    else if (category.includes("STRATEGIC")) color = "blue";
    else if (category.includes("INCREMENTAL")) color = "orange";
    
    return {
        scores: {
            volumeScale: Math.round(volumeScale), 
            costEfficiency: Math.round(costEfficiency), 
            riskCompliance: Math.round(riskCompliance),
            feasibility: Math.round(totalFeasibility), 
            strategicImpact: Math.round(strategicImpact), 
            businessImpact: Math.round(businessImpact),
            totalScore: Math.round(totalScore),
            category, 
            color,
        },
        flags
    };
};
