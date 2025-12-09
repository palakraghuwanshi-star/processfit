import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FormValues } from "@/app/lib/schema";

interface KeyInsightsProps {
  flags: string[];
  formData: FormValues;
}

export function KeyInsights({ flags, formData }: KeyInsightsProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Key Insights</CardTitle>
        <CardDescription>
          Notable strengths and concerns from your submission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-primary">Strengths</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
              {formData.documentationStatus === "Fully documented and current" && <li>✅ Excellent documentation (SOPs are current)</li>}
              {formData.processStandardization > 90 && <li>✅ Highly standardized process</li>}
              {formData.exceptionHandling < 5 && <li>✅ Very low exception rate</li>}
              {formData.systems.every(s => s.hasApi === "Yes") && <li>✅ All systems have APIs</li>}
              {formData.teamSize < 3 && <li>✅ Small team, easier to coordinate</li>}
            </ul>
          </div>
           {flags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-destructive">Concerns & Flags</h3>
             <ScrollArea className="h-40">
                <ul className="space-y-2 text-sm text-foreground">
                    {flags.map((flag, index) => (
                    <li key={index} className="p-2 bg-destructive/10 border-l-4 border-destructive rounded-r-md">
                        {flag}
                    </li>
                    ))}
                </ul>
            </ScrollArea>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
