import { z } from "zod";
import { sendEmail } from "../utils/email";

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

const inputSchema = z.object({
  contactInfo: z
    .string()
    .optional()
    .describe("Contact information of the user email or phone number"),
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
  const isEmail = type.contactInfo?.includes("@") ?? false;

  // if it is email send email else send whatsapp or sms

  const messageToSend = `Hello, I would like to schedule a ${type.serviceType} service. ${
    type.details ? `Here are the details: ${type.details}.` : ""
  } ${
    type.preferredDate
      ? `My preferred date for the service is ${type.preferredDate}.`
      : ""
  } ${
    type.preferredTime
      ? `My preferred time for the service is ${type.preferredTime}.`
      : ""
  } Please let me know the available slots. Thank you!`;

  if (isEmail && type.contactInfo) {
    console.error("Sending email to:", type.contactInfo);
    console.error("Message:", messageToSend);

    await sendEmail(
      type.contactInfo,
      `Scheduling ${type.serviceType} Service`,
      messageToSend
    );
  } else {
  }

  // Placeholder for sending message logic
  // In a real implementation, this would send an email or SMS/WhatsApp message

  const wasSent = true;

  if (!wasSent)
    return {
      content: [
        {
          text: `Failed to schedule the ${type.serviceType} service. Please try again later.`,
          type: "text"
        }
      ]
    };

  return {
    content: [
      {
        text: `Successfully scheduled the ${type.serviceType} service for you. You will be contacted via ${
          isEmail ? "email" : "mobile"
        } with the details shortly.`,
        type: "text"
      }
    ]
  };
};
