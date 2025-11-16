import { z } from "zod";

export const CreateLeadFromEmailInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional().default(""),
  snippet: z.string().optional().default(""),
  threadId: z.string().min(1, "threadId is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateLeadFromEmailInput = z.infer<
  typeof CreateLeadFromEmailInputSchema
>;
