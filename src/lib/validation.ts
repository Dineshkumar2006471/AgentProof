import { z } from "zod";
import { endpointAuthTypes } from "@/lib/endpoint-auth";

export const failureRuleSchema = z.object({
  rule: z.string().min(1),
  action: z.string().min(1),
  severity: z.enum(["info", "minor", "major", "critical"])
});

export const accountPasswordSchema = z.string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use no more than 128 characters.");

export const createAgentSchema = z.object({
  name: z.string().min(2),
  endpointUrl: z.string().url(),
  version: z.string().min(1),
  description: z.string().min(20),
  mustNeverDo: z.string().optional(),
  successCriteria: z.string().optional(),
  endpointAuthType: z.enum(endpointAuthTypes).default("none"),
  endpointAuthUsername: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().min(1).max(512).optional()
  ),
  endpointAuthHeaderName: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().regex(/^[a-zA-Z0-9-]+$/, "Use letters, numbers, and hyphens only.").max(80).optional()
  ),
  endpointAuthToken: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().min(1).max(4096).optional()
  )
}).superRefine((value, context) => {
  if ((value.endpointAuthType === "bearer" || value.endpointAuthType === "api_key") && !value.endpointAuthToken) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endpointAuthToken"], message: value.endpointAuthType === "bearer" ? "A bearer token is required." : "An API key is required." });
  }
  if (value.endpointAuthType === "basic") {
    if (!value.endpointAuthUsername) context.addIssue({ code: z.ZodIssueCode.custom, path: ["endpointAuthUsername"], message: "A Basic authentication username is required." });
    if (!value.endpointAuthToken) context.addIssue({ code: z.ZodIssueCode.custom, path: ["endpointAuthToken"], message: "A Basic authentication password is required." });
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
  password: accountPasswordSchema,
  acceptedPolicies: z.literal(true, { errorMap: () => ({ message: "Accept the Terms and Privacy Policy to create an account." }) }),
  captchaToken: z.string().min(1).max(2048).optional()
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
  email: z.string().trim().email(),
  captchaToken: z.string().min(1).max(2048).optional()
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
  password: accountPasswordSchema
});
