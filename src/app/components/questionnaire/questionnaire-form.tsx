
"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  Construction,
  TrendingUp,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";

import { formSchema, type FormValues } from "@/app/lib/schema";
import { submitQuestionnaire } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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

function FormSectionHeader({ title }: { title: string }) {
    return <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>;
}

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
      industry: undefined,
      processDescription: "",
      monthlyVolume: '' as unknown as number,
      processFrequency: undefined,
      teamSize: '' as unknown as number,
      timePercentage: '' as unknown as number,
      averageProcessingTime: undefined,
      costPerTransaction: '' as unknown as number,
      currentChallenges: [],
      biggestPainPoint: "",
      errorRate: '' as unknown as number,
      complianceRequirements: [],
      impactOfDelays: undefined,
      processStandardization: '' as unknown as number,
      documentationStatus: undefined,
      exceptionHandling: '' as unknown as number,
      systems: [{ name: "", hasApi: "Yes", isCloud: "Yes" }],
      systemAccess: undefined,
      processBottleneck: undefined,
      stakeholderComplaints: undefined,
      growthLimitation: undefined,
      expectedROI: undefined,
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
        try {
            await submitQuestionnaire(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Submission Error",
                description: "There was a problem submitting your questionnaire.",
            });
        }
    });
  };

  return (
    <FormProvider {...form}>
        <div className="mb-8 border-b">
            <div className="flex justify-center space-x-8">
                {formSections.map((section, index) => (
                    <button
                        key={section.title}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                            "pb-3 text-sm font-medium text-muted-foreground transition-colors",
                            currentStep === index ? "text-primary border-b-2 border-primary" : "hover:text-foreground"
                        )}
                        disabled={isPending}
                    >
                        {section.title}
                    </button>
                ))}
            </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-12">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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

        <div className="flex justify-between items-center pt-8 mt-12">
            <div>
                {currentStep > 0 && (
                     <Button
                        type="button"
                        variant="ghost"
                        onClick={prevStep}
                        disabled={isPending}
                        className="text-muted-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                )}
            </div>

            {currentStep < formSections.length - 1 ? (
            <Button type="button" onClick={nextStep} disabled={isPending}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            ) : (
            <Button type="submit" disabled={isPending}>
                {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                "Submit for Analysis"
                )}
            </Button>
            )}
        </div>
        </form>
    </FormProvider>
  );
}

// Each section is a separate component for clarity
const Section1 = () => (
    <div>
        <FormSectionHeader title="Process Details" />
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="organizationName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What is your organization name?</FormLabel>
                        <FormControl><Input placeholder="e.g., Acme Corporation" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="yourName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What is your name?</FormLabel>
                        <FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField name="processName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What is the name of the process you want to automate?</FormLabel>
                        <FormControl><Input placeholder="e.g., Purchase Requisition to Purchase Order" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="industry" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What industry is your organization in?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an industry" /></SelectTrigger></FormControl>
                            <SelectContent>{Options.industryOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField name="processDescription" render={({ field }) => (
                <FormItem>
                    <FormLabel>Please describe this process, including the main steps and systems involved</FormLabel>
                    <FormControl><Textarea placeholder="Describe the workflow step-by-step and mention which systems are used in each step. For example:
1. Requester submits PR in SAP
2. Manager approves in email
3. Procurement team creates PO in Coupa
4. PO sent to vendor via email..." {...field} rows={5} /></FormControl>
                    <FormDescription className="flex items-center gap-1.5"><Info className="h-3 w-3"/>Include as much detail as possible - this helps us understand your process better</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    </div>
);

const Section2 = () => (
    <div>
        <FormSectionHeader title="Volume & Scale" />
        <div className="space-y-6 max-w-md">
            <FormField name="monthlyVolume" render={({ field }) => (
                <FormItem>
                    <FormLabel>How many transactions does this process handle per month?</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="processFrequency" render={({ field }) => (
                <FormItem>
                    <FormLabel>How often does this process run?</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
        </div>
    </div>
);

const Section3 = () => (
     <div>
        <FormSectionHeader title="Cost & Efficiency" />
        <div className="space-y-6">
            <FormItem>
                <FormLabel>How many people work on this process in a typical month, and what percentage of their time do they spend on it?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                    <FormField name="teamSize" render={({ field }) => (
                        <FormItem>
                             <FormLabel className="font-normal text-muted-foreground">Number of people (monthly)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="timePercentage" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-normal text-muted-foreground">Average % of their monthly time spent on this process</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 50" endIcon="%" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormDescription className="flex items-center gap-1.5"><Info className="h-3 w-3"/>Consider all team members involved - even if they only spend part of their time on this process</FormDescription>
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="averageProcessingTime" render={({ field }) => (
                    <FormItem>
                        <FormLabel>On average, how long does it take to complete one transaction from start to finish?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a time range" /></SelectTrigger></FormControl>
                            <SelectContent>{Options.processingTimeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="costPerTransaction" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What is the estimated cost to process a single transaction?</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 25" startIcon="$" {...field} /></FormControl>
                         <FormDescription className="flex items-center gap-1.5"><Info className="h-3 w-3"/>Include labor time and overhead for one transaction. If unsure, estimate: (Total monthly process cost) ÷ (Monthly transaction volume)</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>
    </div>
);

const Section4 = () => (
    <div>
        <FormSectionHeader title="Pain Points" />
        <div className="space-y-6 max-w-lg">
            <FormField name="currentChallenges" render={() => (
                <FormItem>
                    <FormLabel>What are the main challenges with this process? (Select all that apply)</FormLabel>
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
                    <FormLabel>What is the single biggest problem or frustration with this process?</FormLabel>
                    <FormControl><Textarea placeholder="Describe your top pain point..." {...field} rows={4} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    </div>
);

const Section5 = () => (
     <div>
        <FormSectionHeader title="Risk & Compliance" />
        <div className="space-y-6 max-w-lg">
            <FormField name="errorRate" render={({ field }) => (
                <FormItem>
                    <FormLabel>Approximately what percentage of transactions require rework due to errors?</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 15" endIcon="%" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="complianceRequirements" render={() => (
                <FormItem>
                    <FormLabel>What compliance or regulatory requirements apply to this process? (Select all that apply)</FormLabel>
                    <div className="space-y-2 pt-2">
                        {Options.complianceOptions.map(item => (
                            <FormField key={item} name="complianceRequirements" render={({ field }) => (
                                <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                                const currentValues = field.value || [];
                                                if (checked) {
                                                    field.onChange([...currentValues, item]);
                                                } else {
                                                    field.onChange(currentValues.filter((value) => value !== item));
                                                }
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
                    <FormLabel>What happens when this process is delayed?</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
        </div>
    </div>
);

const Section6 = () => (
     <div>
        <FormSectionHeader title="Feasibility" />
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField name="processStandardization" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What percentage of transactions follow the exact same steps?</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 85" endIcon="%" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="exceptionHandling" render={({ field }) => (
                    <FormItem>
                        <FormLabel>What percentage of transactions require special handling or don't follow the standard process?</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 12" endIcon="%" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField name="documentationStatus" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Do you have documented procedures (SOPs) for this process?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
                 <FormField name="systemAccess" render={({ field }) => (
                    <FormItem>
                        <FormLabel>How are these systems accessed?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
            </div>
            <SystemsInput />
        </div>
    </div>
);

const Section7 = () => (
    <div>
        <FormSectionHeader title="Strategic Impact" />
        <div className="space-y-6 max-w-lg">
            <FormField name="processBottleneck" render={({ field }) => (
                <FormItem>
                    <FormLabel>Does this process create bottlenecks for other operations?</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
                    <FormLabel>How often do you receive complaints about this process?</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
                    <FormLabel>Is this manual process limiting your ability to scale or grow?</FormLabel>
                    <FormControl>
                        <RadioGroup onValue-change={field.onChange} defaultValue={field.value} className="space-y-2 pt-1">
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
                    <FormLabel>Based on expected savings, when do you estimate payback?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a timeline" /></SelectTrigger></FormControl>
                        <SelectContent>{Options.roiTimelineOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    </div>
);

    