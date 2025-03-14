import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define schema for structured output
const outputSchema = z.object({
  summary: z.string().describe("A concise summary of the GitHub repository"),
  cool_facts: z
    .array(z.string())
    .describe("A list of interesting facts about the repository"),
});

export async function summarizeReadme(readmeContent) {
  const prompt = ChatPromptTemplate.fromTemplate(`
    Summarize this github repository from this README file content.
    Provide a clear summary and extract interesting facts.
    
    README Content:
    {readme}
  `);

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
  });

  const modelWithStructure = model.withStructuredOutput(outputSchema);

  const chain = prompt.pipe(modelWithStructure);

  const response = await chain.invoke({
    readme: readmeContent,
  });

  return response;
}
