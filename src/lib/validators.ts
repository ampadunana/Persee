// src/lib/validators.ts
import { z } from "zod";

const domainRe =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export const domainSchema = z.object({
  domain: z.string().trim().toLowerCase().regex(domainRe, "Enter a valid domain like example.com"),
});

// Server-only email flow: server generates snippet + one-time code.
// We only accept email + domain from client.
export const sendSnippetSchema = z.object({
  email: z.string().email("Enter a valid email"),
  domain: z.string().trim().toLowerCase().regex(domainRe, "Invalid domain"),
});
