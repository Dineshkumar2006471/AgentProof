import { z } from "zod";

export const failureRuleSchema = z.object({
  rule: z.string().min(1),
  action: z.string().min(1),
  severity: z.enum(["info", "minor", "major", "critical"])
});

export const createAgentSchema = z.object({
  name: z.string().min(2),
  endpointUrl: z.string().url(),
  version: z.string().min(1),
  description: z.string().min(20),
  mustNeverDo: z.string().optional(),
  successCriteria: z.string().optional(),
  endpointAuthType: z.enum(["none", "bearer"]).default("none"),
  endpointAuthToken: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().min(1).max(4096).optional()
  )
}).superRefine((value, context) => {
  if (value.endpointAuthType === "bearer" && !value.endpointAuthToken) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endpointAuthToken"], message: "A bearer token is required." });
  }
});

export const updateContractSchema = z.object({
  version: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  restrictions: z.array(z.string().min(1)).default([]),
  requiredBehavior: z.array(z.string().min(1)).default([]),
  failurePolicy: z.array(failureRuleSchema).default([])
});

export const startRunSchema = z.object({
  contractId: z.string().min(1).optional()
});

export const generateTestsSchema = z.object({
  contractId: z.string().min(1)
});

export const checkoutSchema = z.object({
  plan: z.enum(["builder", "agency", "pay_per_verification"])
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128)
});

export const confirmSignUpSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6)
});

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
  password: z.string().min(12).max(128)
});
