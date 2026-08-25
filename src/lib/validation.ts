import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(2),
  endpointUrl: z.string().url(),
  version: z.string().min(1),
  description: z.string().min(20),
  mustNeverDo: z.string().optional(),
  successCriteria: z.string().optional()
});

export const updateContractSchema = z.object({
  version: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  restrictions: z.array(z.string().min(1)).default([]),
  requiredBehavior: z.array(z.string().min(1)).default([]),
  failurePolicy: z.record(z.array(z.string())).default({})
});

export const startRunSchema = z.object({
  contractId: z.string().min(1).optional()
});

export const checkoutSchema = z.object({
  plan: z.enum(["builder", "agency", "pay_per_verification"])
});
