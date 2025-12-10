import { ScrollArea } from "@/components/ui/scroll-area";
import type { FormValues } from "@/app/lib/schema";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface KeyInsightsProps {
  flags: string[];
  formData: FormValues;
}

export function KeyInsights({ flags, formData }: KeyInsightsProps) {
  const strengths = [
    formData.documentationStatus === "Fully documented and current" && "Excellent documentation (SOPs are current)",
    formData.processStandardization > 90 && "Highly standardized process",
    formData.exceptionHandling < 5 && "Very low exception rate",
    formData.systems.every(s => s.hasApi === "Yes") && "All systems have APIs",
    formData.teamSize < 3 && "Small team, easier to coordinate",
  ].filter(Boolean) as string[];


  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground">Key Insights</h2>
      <p className="text-muted-foreground mt-1">
          Notable strengths and concerns from your submission.
      </p>
      <div className="mt-6 space-y-6">
        {strengths.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center text-green-600 dark:text-green-500">
                <CheckCircle className="mr-2 h-5 w-5" />
                Strengths
            </h3>
            <ul className="space-y-2 text-sm text-foreground">
                {strengths.map((strength, i) => (
                    <li key={i} className="pl-7">{strength.replace('✅ ', '')}</li>
                ))}
            </ul>
          </div>
        )}
        
        {flags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center text-amber-600 dark:text-amber-500">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Concerns & Flags
            </h3>
             <ScrollArea className="h-40">
                <ul className="space-y-2 text-sm text-foreground">
                    {flags.map((flag, index) => (
                        <li key={index} className="p-2 bg-amber-500/10 border-l-4 border-amber-500/80 rounded-r-md">
                            {flag}
                        </li>
                    ))}
                </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    </section>
  );
}
