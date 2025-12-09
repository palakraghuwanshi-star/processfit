"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  FileText,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  Construction,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

import { formSchema, type FormValues } from "@/app/lib/schema";
import { submitQuestionnaire } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { FormSection } from "./form-section";
import { SystemsInput } from "./systems-input";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

import * as Options from "@/app/lib/form-options";

const formSections = [
  {
    title: "Process Details",
    icon: FileText,
    fields: ["organizationName", "yourName", "processName", "industry", "processDescription"],
  },
  {
    title: "Volume & Scale",
    icon: TrendingUp,
    fields: ["monthlyVolume", "processFrequency"],
  },
  {
    title: "Cost & Efficiency",
    icon: DollarSign,
    fields: ["teamSize", "timePercentage", "averageProcessingTime", "costPerTransaction"],
  },
  {
    title: "Pain Points",
    icon: HeartPulse,
    fields: ["currentChallenges", "biggestPainPoint"],
  },
  {
    title: "Risk & Compliance",
    icon: AlertTriangle,
    fields: ["errorRate", "complianceRequirements", "impactOfDelays"],
  },
  {
    title: "Feasibility",
    icon: Construction,
    fields: ["processStandardization", "documentationStatus", "exceptionHandling", "systems", "systemAccess"],
  },
  {
    title: "Strategic Impact",
    icon: TrendingUp,
    fields: ["processBottleneck", "stakeholderComplaints", "growthLimitation", "expectedROI"],
  },
] as const;

type FieldName = (typeof formSections)[number]["fields"][number];

export function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      yourName: "",
      processName: "",
      processDescription: "",
      monthlyVolume: undefined,
      teamSize: undefined,
      timePercentage: undefined,
      costPerTransaction: undefined,
      currentChallenges: [],
      biggestPainPoint: "",
      errorRate: undefined,
      complianceRequirements: [],
      processStandardization: undefined,
      exceptionHandling: undefined,
      systems: [{ name: "", hasApi: "Yes", isCloud: "Yes" }],
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = formSections[currentStep].fields as FieldName[];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill out all required fields before proceeding.",
        });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      await submitQuestionnaire(data);
    });
  };
  
  const progress = ((currentStep + 1) / formSections.length) * 100;
  const CurrentIcon = formSections[currentStep].icon;

  return (
    <FormProvider {...form}>
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {formSections.length}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <CurrentIcon className="h-4 w-4"/>
                    <span>{formSections[currentStep].title}</span>
                </div>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 0 && <Section1 />}
                    {currentStep === 1 && <Section2 />}
                    {currentStep === 2 && <Section3 />}
                    {currentStep === 3 && <Section4 />}
                    {currentStep === 4 && <Section5 />}
                    {currentStep === 5 && <Section6 />}
                    {currentStep === 6 && <Section7 />}
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0 || isPending}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < formSections.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={isPending}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit for Analysis
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}

// Each section is a separate component for clarity
const Section1 = () => (
    <FormSection title="Process Details" description="Let's start with some basic information about your organization and the process.">
        <FormField name="organizationName" render={({ field }) => (
            <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl><Input placeholder="e.g., Acme Corporation" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="yourName" render={({ field }) => (
            <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="processName" render={({ field }) => (
            <FormItem>
                <FormLabel>Process Name</FormLabel>
                <FormControl><Input placeholder="e.g., Purchase Requisition to Purchase Order" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="industry" render={({ field }) => (
            <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl>
                    <SelectContent>{Options.industryOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="processDescription" render={({ field }) => (
            <FormItem>
                <FormLabel>Process Description</FormLabel>
                <FormControl><Textarea placeholder="Describe the workflow step-by-step..." {...field} rows={6} /></FormControl>
                <FormDescription>Include as much detail as possible - this helps us understand your process better.</FormDescription>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section2 = () => (
    <FormSection title="Volume & Scale" description="How large and frequent is this process?">
        <FormField name="monthlyVolume" render={({ field }) => (
            <FormItem>
                <FormLabel>Monthly Transaction Volume</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="processFrequency" render={({ field }) => (
            <FormItem>
                <FormLabel>Process Frequency</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.processFrequencyOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section3 = () => (
    <FormSection title="Cost & Efficiency" description="Understand the financial and time impact of the process.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField name="teamSize" render={({ field }) => (
                <FormItem>
                    <FormLabel>Number of people (monthly)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="timePercentage" render={({ field }) => (
                <FormItem>
                    <FormLabel>Avg. % of time spent</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 50" endIcon="%" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormDescription>Consider all team members involved, even if part-time on this process.</FormDescription>

        <FormField name="averageProcessingTime" render={({ field }) => (
            <FormItem>
                <FormLabel>Average Processing Time per Transaction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a time range" /></SelectTrigger></FormControl>
                    <SelectContent>{Options.processingTimeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="costPerTransaction" render={({ field }) => (
            <FormItem>
                <FormLabel>Estimated Cost per Transaction</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 25" startIcon="$" {...field} /></FormControl>
                 <FormDescription>If unsure, estimate: (Total monthly process cost) / (Monthly transaction volume)</FormDescription>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section4 = () => (
    <FormSection title="Pain Points" description="Help us understand the challenges you're facing.">
        <FormField name="currentChallenges" render={({ field }) => (
            <FormItem>
                <FormLabel>Main Challenges</FormLabel>
                 <FormDescription>Select all that apply.</FormDescription>
                <div className="space-y-2 pt-2">
                    {Options.challengesOptions.map((item) => (
                        <FormField key={item} name="currentChallenges" render={({ field }) => (
                             <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...(field.value || []), item])
                                            : field.onChange(field.value?.filter((value) => value !== item));
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                            </FormItem>
                        )} />
                    ))}
                </div>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="biggestPainPoint" render={({ field }) => (
            <FormItem>
                <FormLabel>Biggest Pain Point</FormLabel>
                <FormControl><Textarea placeholder="Describe your top pain point..." {...field} rows={4} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section5 = () => (
    <FormSection title="Risk & Compliance" description="Assess the process's exposure to errors and regulations.">
         <FormField name="errorRate" render={({ field }) => (
            <FormItem>
                <FormLabel>Rework/Error Rate</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 15" endIcon="%" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField name="complianceRequirements" render={({ field }) => (
            <FormItem>
                <FormLabel>Compliance Requirements</FormLabel>
                <FormDescription>Select all that apply.</FormDescription>
                <div className="space-y-2 pt-2">
                    {Options.complianceOptions.map(item => (
                        <FormField key={item} name="complianceRequirements" render={({ field }) => (
                            <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...field.value, item])
                                            : field.onChange(field.value?.filter((value) => value !== item));
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                            </FormItem>
                        )} />
                    ))}
                </div>
                <FormMessage />
            </FormItem>
        )} />
         <FormField name="impactOfDelays" render={({ field }) => (
            <FormItem>
                <FormLabel>Impact of Delays</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.delayImpactOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section6 = () => (
    <FormSection title="Feasibility" description="Let's determine how automatable your process is.">
        <FormField name="processStandardization" render={({ field }) => (
            <FormItem>
                <FormLabel>Process Standardization Rate</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 85" endIcon="%" {...field} /></FormControl>
                <FormDescription>What percentage of transactions follow the exact same steps?</FormDescription>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="documentationStatus" render={({ field }) => (
            <FormItem>
                <FormLabel>Documentation Status (SOPs)</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.sopStatusOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField name="exceptionHandling" render={({ field }) => (
            <FormItem>
                <FormLabel>Exception Rate</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 12" endIcon="%" {...field} /></FormControl>
                <FormDescription>What percentage of transactions require special handling?</FormDescription>
                <FormMessage />
            </FormItem>
        )} />
        <SystemsInput />
        <FormField name="systemAccess" render={({ field }) => (
            <FormItem>
                <FormLabel>System Access</FormLabel>
                 <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.systemAccessOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);

const Section7 = () => (
    <FormSection title="Strategic Impact" description="How does this process affect the broader business goals?">
         <FormField name="processBottleneck" render={({ field }) => (
            <FormItem>
                <FormLabel>Process Bottleneck</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.bottleneckOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField name="stakeholderComplaints" render={({ field }) => (
            <FormItem>
                <FormLabel>Stakeholder Complaints</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.complaintsOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField name="growthLimitation" render={({ field }) => (
            <FormItem>
                <FormLabel>Growth Limitation</FormLabel>
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {Options.growthLimitOptions.map(o => (
                            <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value={o} /></FormControl>
                                <FormLabel className="font-normal">{o}</FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />
         <FormField name="expectedROI" render={({ field }) => (
            <FormItem>
                <FormLabel>Expected ROI Payback</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a timeline" /></SelectTrigger></FormControl>
                    <SelectContent>{Options.roiTimelineOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
    </FormSection>
);
