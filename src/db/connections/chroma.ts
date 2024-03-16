import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import { getProbotInstance } from "../../auth";

const API_KEY = process.env.OPENAI_API_KEY;
const client = new ChromaClient();
const app = getProbotInstance();

function getEmbedder() {
  if (API_KEY === undefined) {
    app.log.info("openai api key is undefined");
    return;
  }

  return new OpenAIEmbeddingFunction({
    openai_api_key: API_KEY,
  });
}

export async function connectChromaDB() {
  try {
    await client.heartbeat();
    app.log.info(`Connected to chromadb successfully`);
    return client;
  } catch (error: any) {
    app.log.error(`chromadb is down`);
    throw error;
  }
}

export async function createVectorCollection(name: string) {
  try {
    client.getCollection({ name: name }).catch(() => {
      // only create a collection when it's not already present
      client.createCollection({
        name: name,
        embeddingFunction: getEmbedder(),
      });
      app.log.info(`Successfully created ${name} collection in chromadb`);
    });
  } catch (error: any) {
    app.log.error(`Error occured during collection creation in chromadb`);
    app.log.error(error);
  }
}

export async function getVectorCollection(name: string) {
  // replacing getCollection() to getOrCreateCollection because chroma requires
  // us to provide a embeddings function while getting a collection. I am not sure
  // exactly why they are doing it?
  return await client.getOrCreateCollection({
    name: name,
    embeddingFunction: getEmbedder(),
  });
}
