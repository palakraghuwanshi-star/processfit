
'use client';

import type { FormValues } from '@/app/lib/schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FullResponsesProps {
  formData: FormValues;
}

// A helper to format the display of various answer types
const formatAnswer = (answer: any) => {
  if (answer === undefined || answer === null || (Array.isArray(answer) && answer.length === 0)) {
    return <span className="text-muted-foreground italic">Not answered</span>;
  }
  if (Array.isArray(answer)) {
    return (
      <div className="flex flex-wrap gap-2">
        {answer.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    );
  }
  if (typeof answer === 'object' && answer !== null) {
     return <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-2 rounded-md">{JSON.stringify(answer, null, 2)}</pre>;
  }
  return String(answer);
};

// Maps field names to human-readable questions
const questionMap: Record<keyof FormValues, string> = {
    organizationName: "What is your organization name?",
    yourName: "What is your name?",
    processName: "What is the name of the process you want to automate?",
    industry: "What industry is your organization in?",
    processDescription: "Please describe this process, including the main steps and systems involved.",
    monthlyVolume: "How many transactions does this process handle per month?",
    processFrequency: "How often does this process run?",
    teamSize: "Number of people working on this process (monthly)",
    timePercentage: "Average % of their monthly time spent on this process",
    averageProcessingTime: "On average, how long does it take to complete one transaction from start to finish?",
    costPerTransaction: "What is the estimated cost to process a single transaction?",
    currentChallenges: "What are the main challenges with this process?",
    impactOfDelays: "What happens when this process is delayed?",
    biggestPainPoint: "What is the single biggest problem or frustration with this process?",
    errorRate: "Approximately what percentage of transactions require rework due to errors?",
    complianceRequirements: "What compliance or regulatory requirements apply to this process?",
    documentationStatus: "Do you have documented procedures (SOPs) for this process?",
    documentationPercentage: "What percentage of the process is documented?",
    reliesOnTribalKnowledge: "Does the process rely heavily on individual judgment or 'tribal knowledge'?",
    processStandardization: "What percentage of transactions follow the exact same steps?",
    exceptionHandling: "What percentage of transactions require special handling or don't follow the standard process?",
    systems: "What systems are involved in this process?",
    systemAccess: "How are these systems accessed?",
    processBottleneck: "Does this process create bottlenecks for other operations?",
    stakeholderComplaints: "How often do you receive complaints about this process?",
    growthLimitation: "Is this manual process limiting your ability to scale or grow?",
    expectedROI: "Based on expected savings, when do you estimate payback?",
    // New Questions
    documentProcessing: "Does this process involve processing documents (invoices, contracts, forms, receipts, etc.)?",
    crossSystemValidation: "Does this process require validating or matching data across multiple systems?",
    decisionComplexity: "What level of decision-making is required in this process?",
    communicationNeeds: "What types of communication does this process require?",
    humanInLoop: "How often does this process need human review or approval?",
};

// Defines the order of questions to match the form
const orderedFields: (keyof FormValues)[] = [
    'organizationName',
    'yourName',
    'processName',
    'industry',
    'processDescription',
    'monthlyVolume',
    'processFrequency',
    'teamSize',
    'timePercentage',
    'averageProcessingTime',
    'costPerTransaction',
    'currentChallenges',
    'impactOfDelays',
    'biggestPainPoint',
    'errorRate',
    'complianceRequirements',
    'documentationStatus',
    'documentationPercentage',
    'reliesOnTribalKnowledge',
    'processStandardization',
    'exceptionHandling',
    'systems',
    'systemAccess',
    'processBottleneck',
    'stakeholderComplaints',
    'growthLimitation',
    'expectedROI',
    'documentProcessing',
    'crossSystemValidation',
    'decisionComplexity',
    'communicationNeeds',
    'humanInLoop',
];

export function FullResponses({ formData }: FullResponsesProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground">Full Questionnaire Responses</h2>
      <p className="text-muted-foreground mt-1">A detailed view of all submitted answers.</p>
      <div className="mt-6 border rounded-lg p-2 md:p-4">
        <Accordion type="multiple" className="w-full">
            {orderedFields.map((key) => {
                const value = formData[key];
                const question = questionMap[key as keyof FormValues];

                // Don't render items that were never answered or are optional and empty
                if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
                    // But still render for fields that are conditionally rendered but were not required.
                     if (key !== 'documentationPercentage' && key !== 'reliesOnTribalKnowledge' && key !== 'impactOfDelays') {
                        return null;
                     }
                }

                if (!question) return null;

                // Special rendering for the 'systems' array
                if (key === 'systems' && Array.isArray(value)) {
                    return (
                        <AccordionItem value={key} key={key}>
                            <AccordionTrigger className="text-left hover:no-underline font-semibold">{question}</AccordionTrigger>
                            <AccordionContent>
                                {value.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>System Name</TableHead>
                                                <TableHead>Has APIs?</TableHead>
                                                <TableHead>Cloud-based?</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {value.map((system, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{system.name || 'N/A'}</TableCell>
                                                    <TableCell>{system.hasApi || 'N/A'}</TableCell>
                                                    <TableCell>{system.isCloud ?? 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="p-4 bg-muted/50 rounded-md text-sm">
                                        <span className="text-muted-foreground italic">Not answered</span>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )
                }

                return (
                    <AccordionItem value={key} key={key}>
                        <AccordionTrigger className="text-left hover:no-underline font-semibold">{question}</AccordionTrigger>
                        <AccordionContent className="pt-2">
                           <div className="p-4 bg-muted/50 rounded-md text-sm">{formatAnswer(value)}</div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
      </div>
    </section>
  );
}
