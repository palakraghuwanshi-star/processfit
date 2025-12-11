
'use client';

import * as React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { saveAssessment } from '@/app/lib/data-store';

import { formSchema, type FormValues } from '@/app/lib/schema';
import { calculateScores } from '@/app/lib/scoring';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { SystemsInput } from './systems-input';
import { MultiStepProgressBar } from './multi-step-progress-bar';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

import * as Options from '@/app/lib/form-options';

const formSections = [
  {
    title: 'Process Details',
    icon: FileText,
    fields: ['organizationName', 'yourName', 'processName', 'industry', 'processDescription'],
  },
  {
    title: 'Volume & Scale',
    icon: TrendingUp,
    fields: ['monthlyVolume', 'processFrequency'],
  },
  {
    title: 'Cost & Efficiency',
    icon: DollarSign,
    fields: ['teamSize', 'timePercentage', 'averageProcessingTime', 'costPerTransaction'],
  },
  {
    title: 'Pain Points',
    icon: HeartPulse,
    fields: ['currentChallenges', 'impactOfDelays', 'biggestPainPoint'],
  },
  {
    title: 'Risk & Compliance',
    icon: AlertTriangle,
    fields: ['errorRate', 'complianceRequirements'],
  },
  {
    title: 'Feasibility',
    icon: Construction,
    fields: [
      'documentationStatus',
      'documentationPercentage',
      'reliesOnTribalKnowledge',
      'processStandardization',
      'exceptionHandling',
      'systems',
      'systemAccess',
    ],
  },
  {
    title: 'Strategic Impact',
    icon: TrendingUp,
    fields: ['processBottleneck', 'stakeholderComplaints', 'growthLimitation', 'expectedROI'],
  },
] as const;

type FieldName = (typeof formSections)[number]['fields'][number];

function FormSectionHeader({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>;
}

export function QuestionnaireForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      organizationName: '',
      yourName: '',
      processName: '',
      industry: undefined,
      processDescription: '',
      monthlyVolume: '' as unknown as number,
      processFrequency: undefined,
      teamSize: '' as unknown as number,
      timePercentage: '' as unknown as number,
      averageProcessingTime: undefined,
      costPerTransaction: '' as unknown as number,
      currentChallenges: [],
      biggestPainPoint: '',
      errorRate: '' as unknown as number,
      complianceRequirements: [],
      impactOfDelays: undefined,
      documentationStatus: undefined,
      documentationPercentage: '' as unknown as number,
      reliesOnTribalKnowledge: undefined,
      processStandardization: '' as unknown as number,
      exceptionHandling: '' as unknown as number,
      systems: [{ name: '', hasApi: 'Yes', isCloud: 'Yes' }],
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
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill out all required fields before proceeding.',
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to submit the form. Please wait a moment and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate a simple client-side UUID
      const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      const { scores, flags } = calculateScores(data);

      await saveAssessment(user.uid, id, {
        submittedAt: new Date(),
        formData: data,
        scores,
        flags,
      });

      router.push(`/analysis/${id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'There was a problem submitting your questionnaire.',
      });
      setIsSubmitting(false);
    }
  };

  const isPending = isSubmitting || isUserLoading;

  return (
    <FormProvider {...form}>
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-12">
            <MultiStepProgressBar sections={formSections} currentStep={currentStep} />
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

          <div className="flex justify-between items-center pt-8 mt-12 border-t">
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
                  'Submit for Analysis'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

// Each section is a separate component for clarity
const Section1 = () => (
  <div>
    <FormSectionHeader title="Process Details" />
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is your organization name?</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Acme Corporation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="yourName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is your name?</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="processName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is the name of the process you want to automate?</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Purchase Requisition to Purchase Order" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What industry is your organization in?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Options.industryOptions.map(o => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        name="processDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Please describe this process, including the main steps and systems involved
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the workflow step-by-step and mention which systems are used in each step. For example:
1. Requester submits PR in SAP
2. Manager approves in email
3. Procurement team creates PO in Coupa
4. PO sent to vendor via email..."
                {...field}
                rows={5}
              />
            </FormControl>
            <FormDescription className="flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              Include as much detail as possible - this helps us understand your process better
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

const Section2 = () => (
  <div>
    <FormSectionHeader title="Volume & Scale" />
    <div className="space-y-6 max-w-md">
      <FormField
        name="monthlyVolume"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How many transactions does this process handle per month?</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="processFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How often does this process run?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 pt-1"
              >
                {Options.processFrequencyOptions.map(o => (
                  <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={o} />
                    </FormControl>
                    <FormLabel className="font-normal">{o}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

const Section3 = () => (
  <div>
    <FormSectionHeader title="Cost & Efficiency" />
    <div className="space-y-6">
      <FormItem>
        <FormLabel>
          How many people work on this process in a typical month, and what percentage of their
          time do they spend on it?
        </FormLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <FormField
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal text-muted-foreground">
                  Number of people (monthly)
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="timePercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal text-muted-foreground">
                  Average % of their monthly time spent on this process
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    endIcon="%"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription className="flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Consider all team members involved - even if they only spend part of their time on this
          process
        </FormDescription>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="averageProcessingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                On average, how long does it take to complete one transaction from start to finish?
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Options.processingTimeOptions.map(o => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="costPerTransaction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What is the estimated cost to process a single transaction?</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  startIcon="$"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-1.5">
                <Info className="h-3 w-3" />
                Include labor time and overhead for one transaction. If unsure, estimate: (Total
                monthly process cost) ÷ (Monthly transaction volume)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  </div>
);

const Section4 = () => {
  const { watch } = useFormContext<FormValues>();
  const currentChallenges = watch('currentChallenges') || [];
  const showImpactOfDelays = currentChallenges.includes('Takes too long to complete');

  return (
    <div>
      <FormSectionHeader title="Pain Points" />
      <div className="space-y-6 max-w-lg">
        <FormField
          name="currentChallenges"
          render={() => (
            <FormItem>
              <FormLabel>
                What are the main challenges with this process? (Select all that apply)
              </FormLabel>
              <div className="space-y-2 pt-2">
                {Options.challengesOptions.map(item => (
                  <FormField
                    key={item}
                    name="currentChallenges"
                    render={({ field }) => (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={checked => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(field.value?.filter(value => value !== item));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <AnimatePresence>
          {showImpactOfDelays && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormField
                name="impactOfDelays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What happens when this process is delayed?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2 pt-1"
                      >
                        {Options.delayImpactOptions.map(o => (
                          <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={o} />
                            </FormControl>
                            <FormLabel className="font-normal">{o}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          name="biggestPainPoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What is the single biggest problem or frustration with this process?
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your top pain point..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const Section5 = () => (
  <div>
    <FormSectionHeader title="Risk & Compliance" />
    <div className="space-y-6 max-w-lg">
      <FormField
        name="errorRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Approximately what percentage of transactions require rework due to errors?
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g., 15"
                endIcon="%"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="complianceRequirements"
        render={() => (
          <FormItem>
            <FormLabel>
              What compliance or regulatory requirements apply to this process? (Select all that
              apply)
            </FormLabel>
            <div className="space-y-2 pt-2">
              {Options.complianceOptions.map(item => (
                <FormField
                  key={item}
                  name="complianceRequirements"
                  render={({ field }) => (
                    <FormItem
                      key={item}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item)}
                          onCheckedChange={checked => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, item]);
                            } else {
                              field.onChange(currentValues.filter(value => value !== item));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

const Section6 = () => {
  const { watch } = useFormContext<FormValues>();
  const documentationStatus = watch('documentationStatus');
  const showDocumentationPercentage = documentationStatus === 'Partially documented';
  const showTribalKnowledgeQuestion = documentationStatus === 'No documentation exists';

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-foreground">Feasibility</h2>
      <div className="space-y-6">
        <div className="space-y-6">
            <FormField
              name="documentationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have documented procedures (SOPs) for this process?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2 pt-1"
                    >
                      {Options.sopStatusOptions.map(o => (
                        <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={o} />
                          </FormControl>
                          <FormLabel className="font-normal">{o}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AnimatePresence>
              {showDocumentationPercentage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-lg"
                >
                  <FormField
                    name="documentationPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What percentage of the process is documented?</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 50"
                            endIcon="%"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showTribalKnowledgeQuestion && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-lg"
                >
                  <FormField
                    name="reliesOnTribalKnowledge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Does the process rely heavily on individual judgment or 'tribal knowledge'?</FormLabel>
                         <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center space-x-4 pt-1"
                            >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="Yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Yes</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="No" />
                                    </FormControl>
                                    <FormLabel className="font-normal">No</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        <div className="space-y-4">
          <FormField
            name="processStandardization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What percentage of transactions follow the exact same steps?</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 85"
                    endIcon="%"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="exceptionHandling"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  What percentage of transactions require special handling or don&apos;t follow the
                  standard process?
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    endIcon="%"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SystemsInput />

        <FormField
          name="systemAccess"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are these systems accessed?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-2 pt-1"
                >
                  {Options.systemAccessOptions.map(o => (
                    <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={o} />
                      </FormControl>
                      <FormLabel className="font-normal">{o}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

const Section7 = () => (
  <div>
    <FormSectionHeader title="Strategic Impact" />
    <div className="space-y-6 max-w-lg">
      <FormField
        name="processBottleneck"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Does this process create bottlenecks for other operations?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 pt-1"
              >
                {Options.bottleneckOptions.map(o => (
                  <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={o} />
                    </FormControl>
                    <FormLabel className="font-normal">{o}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="stakeholderComplaints"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How often do you receive complaints about this process?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 pt-1"
              >
                {Options.complaintsOptions.map(o => (
                  <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={o} />
                    </FormControl>
                    <FormLabel className="font-normal">{o}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="growthLimitation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Is this manual process limiting your ability to scale or grow?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 pt-1"
              >
                {Options.growthLimitOptions.map(o => (
                  <FormItem key={o} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={o} />
                    </FormControl>
                    <FormLabel className="font-normal">{o}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="expectedROI"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Based on expected savings, when do you estimate payback?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timeline" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Options.roiTimelineOptions.map(o => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);
