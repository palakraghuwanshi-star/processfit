
export const industryOptions = [
  "Finance & Banking",
  "Healthcare & Pharma",
  "Manufacturing",
  "Retail & E-commerce",
  "Logistics & Freight",
  "Telecommunications",
  "Energy & Utilities",
  "Other",
] as const;

export const processFrequencyOptions = [
  "Annually or quarterly",
  "Monthly",
  "Weekly",
  "Daily",
  "Continuous (multiple times per day)",
] as const;

export const processingTimeOptions = [
  "Less than 1 day",
  "1-2 days",
  "3-5 days",
  "6-10 days",
  "11-15 days",
  "More than 15 days",
] as const;

export const challengesOptions = [
  "Takes too long to complete",
  "High labor costs",
  "Frequent errors requiring rework",
  "Bottlenecks and delays",
  "Difficult to scale without hiring",
  "Depends on specific people's knowledge",
  "Compliance or audit concerns",
  "Poor visibility into process status",
  "Affects customer/vendor satisfaction",
  "Other",
] as const;

export const complianceOptions = [
  "None",
  "Internal audit only",
  "Industry standards (ISO, etc.)",
  "Government regulations (SOX, FDA, GDPR, etc.)",
  "Multiple high-level regulatory requirements",
] as const;

export const delayImpactOptions = [
  "Minimal impact, no direct costs",
  "Some operational inconvenience",
  "Significant cash flow impact",
  "Financial penalties or late fees",
  "Major penalties and/or vendor relationship damage",
] as const;

export const sopStatusOptions = [
  "No documentation exists",
  "Partially documented",
  "Documented but outdated",
  "Fully documented and current",
] as const;

export const systemAccessOptions = [
  "All systems are cloud-based and accessible externally",
  "Most systems require VPN but are accessible remotely",
  "Some systems are on internal network only",
  "All systems are internal/intranet only",
] as const;

export const bottleneckOptions = [
  "No, it operates independently",
  "Minimal impact on other processes",
  "Moderate delays to downstream processes",
  "Significant blocker for multiple processes",
] as const;

export const complaintsOptions = [
  "Rarely or never",
  "Occasionally (few per quarter)",
  "Regularly (monthly)",
  "Frequently (weekly or daily)",
] as const;

export const growthLimitOptions = [
  "No constraints",
  "Minor constraints",
  "Moderate constraints, would need significant hiring to scale",
  "Major constraints, actively limiting growth",
] as const;

export const roiTimelineOptions = [
  "More than 3 years",
  "2-3 years",
  "18-24 months",
  "12-18 months",
  "6-12 months",
  "Less than 6 months",
] as const;
