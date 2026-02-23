import OpenAI from "openai";

declare global {
  // eslint-disable-next-line no-var
  var __openaiClient: OpenAI | undefined;
}

export const openai: OpenAI =
  global.__openaiClient ??
  (global.__openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }));
