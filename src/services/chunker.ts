import {
  RecursiveCharacterTextSplitter,
  SupportedTextSplitterLanguage,
} from "langchain/text_splitter";
import { detectLanguage } from "../utils";

export async function chunker(file: string, filePath: string) {
  const language: SupportedTextSplitterLanguage = detectLanguage(filePath);
  const splitter = RecursiveCharacterTextSplitter.fromLanguage(language, {
    chunkSize: 300,
    chunkOverlap: 0,
  });

  const documents = await splitter.createDocuments([file]);
  return documents;
}
