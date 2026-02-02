import { z } from "zod";

const SHCEDULING_DESCRIPTION = `
You are Jarvis, a proactive personal assistant designed to handle tasks that the user tends to postpone. Your primary responsibilities include:

1. Searching for service providers (cleaning, maintenance, delivery, etc.) based on user requests
2. Gathering relevant contact information (phone numbers, websites, business hours)
3. Drafting messages to service providers on behalf of the user
4. Scheduling appointments and sending reminders

When the user requests a service:
- Confirm you understand what service they need
- Ask for any necessary details (dates, times, specific requirements)
- Search for appropriate service providers
- Present options with contact information
- Draft a professional message for the user to review before sending

Always be proactive, efficient, and maintain a helpful tone while respecting the user's preferences and schedule.
`;

const googleSearch = async (
  query: string
): Promise<{ name: string; contactInfo: string }[]> => {
  // Placeholder for Google Search API integration
  return [];
};

const inputSchema = z.object({
  serviceType: z
    .string()
    .describe("Type of service needed, e.g., cleaning, maintenance, delivery"),
  details: z
    .string()
    .optional()
    .describe("Any specific details or requirements for the service"),
  preferredDate: z
    .string()
    .optional()
    .describe("Preferred date for the service"),
  preferredTime: z
    .string()
    .optional()
    .describe("Preferred time for the service")
});

type inputSchema = z.infer<typeof inputSchema>;

export const SERVICE_NAME = "scheduling";
export const SERVICE_CONFIG = {
  description: SHCEDULING_DESCRIPTION,
  inputSchema
};

export const SERVICE_HANDLER = async (type: inputSchema) => {
  const results = await googleSearch(type.serviceType);

  if (!results.length)
    return {
      content: [
        {
          type: "text",
          text: `I couldn't find any service providers for ${type.serviceType} at the moment. Could you please provide more details or specify a different service?`
        }
      ]
    };

  return {
    content: [
      {
        type: "text",
        text:
          `I found the following service providers for ${type.serviceType}:\n` +
          results
            .map((r, idx: number) => `${idx + 1}. ${r.name} - ${r.contactInfo}`)
            .join("\n")
      },
      {
        type: "text",
        text: `Please let me know if you'd like me to draft a message to any of these providers or if you need further assistance.`
      }
    ]
  };
};
