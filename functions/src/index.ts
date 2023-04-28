import * as functions from "firebase-functions";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { defineSecret } from "firebase-functions/params";

const openAIApiKey = defineSecret("OPENAI_API_KEY");

/**
 * vectorStoreをロードする
 * @param {string} openAIApiKey
 * @return {Promise<HNSWLib>}
 */
async function loadSavedStore(openAIApiKey: string) {
  console.info("start loading saved store");
  const store = await HNSWLib.load(
    "vectorStore",
    new OpenAIEmbeddings({
      openAIApiKey,
    })
  );
  console.info("loading completed");
  return store;
}

let vectorStore: HNSWLib | null = null;

export const send = functions
  .runWith({ secrets: [openAIApiKey] })
  .https.onCall(async (data) => {
    const apiKey = openAIApiKey.value();
    vectorStore = vectorStore ?? (await loadSavedStore(apiKey));

    const chat = new OpenAI({
      temperature: 0,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: apiKey,
    });

    const chain = ConversationalRetrievalQAChain.fromLLM(
      chat,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
        questionGeneratorTemplate:
          "Using the following context, answer the last question in Japanese. " +
          "If you do not know the answer, do not try to make up an answer, " +
          "just say you do not know.",
      }
    );

    const question = data;
    return await chain.call({ question, chat_history: [] });
  });
