
import { z } from 'zod';
import {
  industryOptions,
  processFrequencyOptions,
  processingTimeOptions,
  challengesOptions,
  complianceOptions,
  delayImpactOptions,
  sopStatusOptions,
  systemAccessOptions,
  bottleneckOptions,
  complaintsOptions,
  growthLimitOptions,
  roiTimelineOptions,
  documentProcessingOptions,
  communicationOptions,
  humanInLoopOptions
} from './form-options';

export const formSchema = z.object({
  // Section 1
  organizationName: z.string().min(1, "Organization name is required."),
  yourName: z.string().min(1, "Your name is required."),
  processName: z.string().min(1, "Process name is required."),
  industry: z.enum(industryOptions, { required_error: "Please select an industry." }),
  processDescription: z.string().min(1, "Process description is required.").max(2000, "Description cannot exceed 2000 characters."),

  // Section 2
  monthlyVolume: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Volume must be positive."),
  processFrequency: z.enum(processFrequencyOptions, { required_error: "Please select a frequency." }),
  
  // Section 3
  teamSize: z.coerce.number({ invalid_type_error: "Must be a number" }).min(1, "Team size must be at least 1."),
  timePercentage: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Must be positive").max(100, "Percentage must be between 0 and 100."),
  averageProcessingTime: z.enum(processingTimeOptions, { required_error: "Please select a processing time." }),
  costPerTransaction: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Cost must be positive."),
  
  // Section 4 (Impact & Pain Points)
  currentChallenges: z.array(z.enum(challengesOptions)).optional(),
  impactOfDelays: z.enum(delayImpactOptions).optional(),
  biggestPainPoint: z.string().max(300, "Cannot exceed 300 characters.").optional(),
  errorRate: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Must be positive").max(100, "Percentage must be between 0 and 100."),
  processBottleneck: z.enum(bottleneckOptions, { required_error: "Please select an option." }),
  stakeholderComplaints: z.enum(complaintsOptions, { required_error: "Please select an option." }),
  growthLimitation: z.enum(growthLimitOptions, { required_error: "Please select an option." }),
  expectedROI: z.enum(roiTimelineOptions, { required_error: "Please select an ROI." }),
  complianceRequirements: z.array(z.enum(complianceOptions)).min(1, "Please select at least one compliance option."),
  
  // Section 5 (Feasibility)
  documentationStatus: z.enum(sopStatusOptions, { required_error: "Please select a documentation status." }),
  documentationPercentage: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Must be positive").max(100, "Percentage must be between 0 and 100.").optional(),
  reliesOnTribalKnowledge: z.enum(['Yes', 'No']).optional(),
  processStandardization: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Must be positive").max(100, "Percentage must be between 0 and 100."),
  exceptionHandling: z.coerce.number({ invalid_type_error: "Must be a number" }).min(0, "Must be positive").max(100, "Percentage must be between 0 and 100."),
  systems: z.array(z.object({
    name: z.string().min(1, "System name is required."),
    hasApi: z.enum(["Yes", "No", "Don't know"], { required_error: "Please select an option." }),
    isCloud: z.enum(["Yes", "No"]).optional(),
  })).min(1, "Please list at least one system."),
  systemAccess: z.enum(systemAccessOptions, { required_error: "Please select system access type." }),
  
  // Section 1 additions (Task Complexity)
  documentProcessing: z.enum(documentProcessingOptions).optional(),
  communicationNeeds: z.array(z.enum(communicationOptions)).optional(),
  humanInLoop: z.enum(humanInLoopOptions, { required_error: "Please select an option." }),
}).superRefine((data, ctx) => {
    if (data.currentChallenges?.includes('Takes too long to complete') && !data.impactOfDelays) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['impactOfDelays'],
            message: 'Please specify the impact of delays.',
        });
    }
    if (data.documentationStatus === 'Partially documented' && data.documentationPercentage === undefined) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['documentationPercentage'],
            message: 'Please specify the percentage of documentation.',
        });
    }
     if (data.documentationStatus === 'No documentation exists' && !data.reliesOnTribalKnowledge) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reliesOnTribalKnowledge'],
            message: 'Please specify if the process relies on tribal knowledge.',
        });
    }
});

export type FormValues = z.infer<typeof formSchema>;

    
