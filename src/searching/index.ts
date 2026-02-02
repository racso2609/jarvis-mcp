import { ApifyClient } from "apify-client";
import { env } from "../env";
import { z } from "zod";

const client = new ApifyClient({
  token: env.SEARCH_API_KEY
});

export const SERVICE_NAME = "searching";
export const SEARCHING_DESCRIPTION = `This service helps users find local service providers based on their needs. It searches for businesses or individuals offering specific services (like cleaning, maintenance, delivery, etc.) in the user's area and provides contact information.

The service follows these steps:
- Search for appropriate service providers
- Present options with contact information
- Draft a professional message for the user to review before sending`;

const InputSchema = z.object({
  serviceType: z
    .string()
    .describe("Type of service needed, e.g., cleaning, maintenance, delivery"),
  location: z.string().describe("Location to search for the service providers")
});

export const SERVICE_CONFIG = {
  description: SEARCHING_DESCRIPTION,
  inputSchema: InputSchema
};

const search = async (query: string) => {
  const input = {
    queries: query,
    resultsPerPage: 20,
    maxPagesPerQuery: 1,
    aiMode: "aiModeOff",
    perplexitySearch: {
      enablePerplexity: false,
      returnImages: false,
      returnRelatedQuestions: false
    },
    maximumLeadsEnrichmentRecords: 0,
    focusOnPaidAds: false,
    searchLanguage: "",
    languageCode: "",
    forceExactMatch: false,
    wordsInTitle: [],
    wordsInText: [],
    wordsInUrl: [],
    mobileResults: false,
    includeUnfilteredResults: false,
    saveHtml: false,
    saveHtmlToKeyValueStore: true,
    includeIcons: false
  };

  const run = await client.actor("nFJndFXA5zjCTuudP").call(input, {
    log: null
  });
  // Placeholder implementation for search functionality
  // In a real implementation, this would call an external search API
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items.at(0)?.organicResults as { title: string; url: string }[];
};

const extractContactInfo = async (urls: string[]) => {
  const run = await client.actor("vdrmota/contact-info-scraper").call(
    {
      startUrls: urls.map(url => ({ url })),
      maxRequestsPerStartUrl: 10,
      maxDepth: 2
    },
    { log: null }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items.map(item => {
    return {
      emails: item.emails,
      phones: item.phones,
      instagrams: item.instagrams,
      facebooks: item.facebooks,
      url: item.originalStartUrl,
      whatsapps: item.whatsapps,
      telegrams: item.telegrams
    } as {
      emails: string[];
      phones: string[];
      instagrams: string[];
      facebooks: string[];
      url: string;
      whatsapps: string[];
      telegrams: string[];
    };
  });
};

export const SERVICE_HANDLER = async (type: z.infer<typeof InputSchema>) => {
  const query = `${type.serviceType} service providers in ${type.location}`;
  const results = await search(query);

  if (!results || results.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `I couldn't find any service providers for ${type.serviceType} in ${type.location} at the moment. Could you please provide more details or specify a different service?`
        }
      ]
    };
  }

  const contactInfos = await extractContactInfo(results.map(r => r.url));

  if (contactInfos.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `I found some service providers for ${type.serviceType} in ${type.location}, but couldn't extract their contact information. Please try again later.`
        }
      ]
    };
  }

  const formattedResults = contactInfos
    .map((info, idx: number) => {
      const contacts = [
        info.emails.map((email: string) => `Email: ${email}`),
        info.phones.map((phone: string) => `Phone: ${phone}`),
        info.whatsapps.map((whatsapp: string) => `WhatsApp: ${whatsapp}`),
        info.telegrams.map((telegram: string) => `Telegram: ${telegram}`),
        info.facebooks.map((fb: string) => `Facebook: ${fb}`),
        info.instagrams.map((ig: string) => `Instagram: ${ig}`)
      ].join(", ");

      return `${idx + 1}. Website: ${info.url}${
        contacts ? ` - Contacts: ${contacts}` : ""
      }`;
    })
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text:
          `I found the following service providers for ${type.serviceType} in ${type.location}:\n` +
          formattedResults
      },
      {
        type: "text",
        text: "Would you like me to help you draft a message to any of these providers?"
      }
    ]
  };
};
