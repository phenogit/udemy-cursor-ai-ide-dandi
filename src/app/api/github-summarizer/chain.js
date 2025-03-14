import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

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
  }).bind({
    functions: [
      {
        name: "output_formatter",
        description: "Format the repository summary and facts",
        parameters: zodToJsonSchema(outputSchema),
      },
    ],
    function_call: { name: "output_formatter" },
  });

  const outputParser = new JsonOutputFunctionsParser();

  const chain = RunnableSequence.from([
    {
      readme: (input) => input.readme,
    },
    prompt,
    model,
    outputParser,
  ]);

  const response = await chain.invoke({
    readme: readmeContent,
  });

  return response;
}
