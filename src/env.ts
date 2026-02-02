import { z } from "zod";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config({
  quiet: true
});

export const env = z
  .object({
    SEARCH_API_KEY: z.string().min(1, "SEARCH_API_KEY is required"),
    EMAIL_USER: z.string().email().min(1, "EMAIL_USER is required"),
    EMAIL_PASSWORD: z.string().min(1, "EMAIL_PASSWORD is required")
  })
  .parse(process.env);
