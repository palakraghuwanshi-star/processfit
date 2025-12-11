
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

// In a real app, you'd fetch this from and save to a backend.
// For this example, we'll simulate it with local state and `require`.
import initialRules from '@/app/lib/scoring-rules.json';


type Rule = {
  criteria: string;
  score: string;
};

type ScoringCategory = {
  title: string;
  description: string;
  rules: Rule[];
};

type KnowledgeBaseData = {
  aiAnalysisPrompt: string;
  scoringCategories: ScoringCategory[];
};


export function KnowledgeBase() {
  const [rules, setRules] = useState(JSON.stringify(initialRules, null, 2));
  const [isSaving, setIsSaving] = useState(false);
  const [parsedData, setParsedData] = useState<KnowledgeBaseData>(initialRules);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const parsed = JSON.parse(rules);
      setParsedData(parsed);
    } catch (e) {
      // Ignore parse errors while typing
    }
  }, [rules]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would be an API call to a backend endpoint
      // that has permission to write to the filesystem.
      // For demonstration, we're just simulating a delay.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would have a server-side function to write the file.
      // Since we can't do that from the client, we'll log it.
      console.log("Saving rules to backend:", rules);
      
      toast({
        title: "Knowledge Base Saved",
        description: "Your changes have been saved. They will be applied to the next analysis.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Saving",
        description: "Could not save the knowledge base. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
        const currentData = JSON.parse(rules);
        currentData.aiAnalysisPrompt = e.target.value;
        setRules(JSON.stringify(currentData, null, 2));
    } catch (error) {
        console.error("Error updating prompt", error);
        toast({
            variant: "destructive",
            title: "JSON Error",
            description: "Could not update prompt due to invalid JSON structure."
        });
    }
  };

  const getCategoryVariant = (score: string) => {
    if (score.includes('QUICK WIN')) return 'default';
    if (score.includes('STRATEGIC')) return 'secondary';
    if (score.includes('INCREMENTAL')) return 'outline';
    if (score.includes('AVOID')) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Scoring & Analysis Rules</h2>
          <p className="text-muted-foreground mt-1">This document outlines the rules used to calculate scores and categorize processes.</p>
        </div>
        <div className="border rounded-lg p-4 bg-card h-[600px] overflow-y-auto">
          <Accordion type="multiple" className="w-full" defaultValue={parsedData.scoringCategories.map(r => r.title)}>
            {parsedData.scoringCategories.map((category) => (
              <AccordionItem value={category.title} key={category.title}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  {category.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criteria / Input</TableHead>
                        <TableHead className="text-right">Score / Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.rules.map((rule) => (
                        <TableRow key={rule.criteria}>
                          <TableCell className="font-medium">{rule.criteria}</TableCell>
                          <TableCell className="text-right">
                            {category.title === 'Process Categorization' ? (
                                <Badge variant={getCategoryVariant(rule.score)}>{rule.score}</Badge>
                            ) : (
                                <span>{rule.score}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <div className="space-y-8">
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">AI Analysis Prompt</h2>
                <p className="text-muted-foreground mt-1">This prompt is sent to the LLM to guide its analysis.</p>
            </div>
            <Textarea 
                value={parsedData.aiAnalysisPrompt}
                onChange={handlePromptChange}
                className="h-[200px] font-mono text-xs"
                aria-label="AI Analysis Prompt Editor"
            />
        </div>
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Knowledge Base Source (JSON)</h2>
                <p className="text-muted-foreground mt-1">Modify the scoring logic or AI prompt below. Changes will affect all future analyses.</p>
            </div>
            <div className="space-y-4">
                <Textarea 
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="h-[300px] font-mono text-xs"
                    aria-label="Scoring Rules JSON Editor"
                />
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Knowledge Base
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
