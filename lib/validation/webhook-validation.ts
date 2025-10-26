import { z } from "zod";

// Schema for validating the minimal webhook payload from AssemblyAI
export const WebhookPayloadSchema = z.object({
  transcript_id: z.string().uuid(),
  status: z.enum(["queued", "processing", "completed", "error"]),
  error: z.string().optional(),
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;