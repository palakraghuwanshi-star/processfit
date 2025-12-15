
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
 */
const evaluateNumericRule = (value: number, criteria: string): boolean => {
    const matchRange = criteria.match(/(\d+)-(\d+)/);
    if (matchRange) {
        const [, min, max] = matchRange.map(Number);
        return value >= min && value <= max;
    }

    const matchOperator = criteria.match(/(<|<=|>|>=)\s*(\d+)/);
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
    const rule = rules.find(r => r.criteria === value);
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

    // Volume & Scale
    const volumeScale = getScoreFromStringRule(data.processFrequency, getRules("Volume & Scale"));
    
    // Cost & Efficiency
    const totalMonthlyValue = data.monthlyVolume * data.costPerTransaction;
    const fteHours = data.teamSize * (data.timePercentage / 100) * 160;
    const costEfficiency = 
        getScoreFromNumericRules(totalMonthlyValue, getRules("Cost & Efficiency")) +
        getScoreFromNumericRules(fteHours, getRules("Cost & Efficiency")) +
        getScoreFromStringRule(data.averageProcessingTime, getRules("Cost & Efficiency"));

    // Risk & Compliance
    const riskCompliance = 
        getScoreFromNumericRules(data.errorRate, getRules("Risk & Compliance")) +
        getScoreFromStringRule(data.complianceRequirements[0] || "None", getRules("Risk & Compliance")) +
        getScoreFromStringRule(data.impactOfDelays || "Minimal impact, no direct costs", getRules("Risk & Compliance"));

    // Feasibility (Original)
    const stdScore = getScoreFromNumericRules(data.processStandardization, getRules("Feasibility"));
    const docScore = getScoreFromStringRule(data.documentationStatus, getRules("Feasibility"));
    const excScore = getScoreFromNumericRules(data.exceptionHandling, getRules("Feasibility"));

    let apiScore: number;
    const apiRules = getRules("Feasibility").filter(r => r.criteria.includes("API Access"));
    if (data.systems.every(s => s.hasApi === "Yes")) {
        apiScore = getScoreFromStringRule("API Access: All systems have APIs", apiRules);
    } else if (data.systems.some(s => s.hasApi === "No" || s.hasApi === "Don't know")) {
        apiScore = getScoreFromStringRule("API Access: Any \"No\" or \"Don't know\" responses", apiRules);
    } else {
        apiScore = getScoreFromStringRule("API Access: Mixed (some with, some without)", apiRules);
    }
    
    const accessScore = getScoreFromStringRule(data.systemAccess, getRules("Feasibility"));
    
    // Task Complexity
    const docProcessingScore = getScoreFromStringRule(data.documentProcessing || 'No documents involved', getRules("Task Complexity"));
    const humanInLoopScore = getScoreFromStringRule(data.humanInLoop, getRules("Task Complexity"));
    const communicationScore = data.communicationNeeds && data.communicationNeeds.length > 0 ? getScoreFromStringRule(`Communication Needs: ${data.communicationNeeds.length} Type${data.communicationNeeds.length > 1 ? 's' : ''}`, getRules("Task Complexity")) : 10;
    
    const complexityScores = [docProcessingScore, humanInLoopScore, communicationScore].filter(s => s !== null) as number[];
    const averageComplexityScore = complexityScores.length > 0
        ? complexityScores.reduce((acc, score) => acc + score, 0) / complexityScores.length
        : 10;
    const taskComplexityScore = Math.round((averageComplexityScore / 10) * 30);


    let feasibilityPenalty = 0;
    if (data.documentationStatus === "No documentation exists" || data.documentationStatus === "Partially documented") {
        feasibilityPenalty = 3;
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

    const rawFeasibility = Math.max(0, stdScore) + docScore + excScore + apiScore + accessScore;
    let baseFeasibility = (rawFeasibility / 50) * 30 - feasibilityPenalty;
    const feasibility = Math.max(0, Math.round(baseFeasibility)) + taskComplexityScore;


    // Strategic Impact
    const strategicImpact = 
        getScoreFromStringRule(data.processBottleneck, getRules("Strategic Impact")) +
        getScoreFromStringRule(data.stakeholderComplaints, getRules("Strategic Impact")) +
        getScoreFromStringRule(data.growthLimitation, getRules("Strategic Impact")) +
        getScoreFromStringRule(data.expectedROI, getRules("Strategic Impact"));

    // Final Calculations
    const businessImpact = volumeScale + costEfficiency + riskCompliance + strategicImpact;
    const totalScore = businessImpact + feasibility;

    let category = "REVISIT";
    let color = "red";
    const categorizationRules = getRules("Process Categorization");

    for (const rule of categorizationRules) {
        const criteria = rule.criteria;
        const impactMatch = criteria.match(/Business Impact (>=|<=) (\d+)/);
        const feasibilityMatch = criteria.match(/Total Feasibility (>=|<=) (\d+)/);

        if (impactMatch && feasibilityMatch) {
            const [, impactOp, impactValStr] = impactMatch;
            const [, feasyOp, feasyValStr] = feasibilityMatch;
            const impactVal = Number(impactValStr);
            const feasyVal = Number(feasyValStr);

            const isImpactMet = impactOp === '>=' ? businessImpact >= impactVal : businessImpact < impactVal;
            const isFeasibilityMet = feasyOp === '>=' ? feasibility >= feasyVal : feasibility < feasyVal;

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
            volumeScale, 
            costEfficiency, 
            riskCompliance,
            feasibility, 
            strategicImpact, 
            businessImpact: Math.round(businessImpact),
            totalScore: Math.round(totalScore),
            category, 
            color,
        },
        flags
    };
};
