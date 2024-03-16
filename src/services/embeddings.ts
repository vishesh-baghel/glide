import { getProbotInstance } from "../auth";
import { getVectorCollection } from "../db/connections/chroma";
import { FileContent } from "../types/File";
import { chunker } from "./chunker";

const app = getProbotInstance();

export async function saveEmbeddings(
  files: FileContent[],
  installationId: number,
  repoName: string
) {
  const collection = await getVectorCollection(`${installationId}.${repoName}`);
  const chunkedFileCodePromises = files.map(async (file) => {
    return {
      filePath: file.filePath,
      chunkedCode: await chunker(file.content, file.filePath),
    };
  });
  const chunkedCode = await Promise.all(chunkedFileCodePromises);

  chunkedCode.map((codeFile) => {
    codeFile.chunkedCode.map((code) => {
      collection
        .add({
          ids: `${installationId}.${repoName}.${codeFile.filePath}`,
          documents: code.pageContent,
        })
        .catch((error: any) => {
          app.log.error(
            `Error occured while saving embeddings for ${installationId}.${repoName}.${codeFile.filePath}`
          );
          app.log.error(error);
        });
    });
  });
  collection
    .peek({
      limit: 10,
    })
    .then((response) => {
      app.log.info("vector embeddings for glide");
      response.documents.map((doc) => doc && app.log.info(doc));
    });
}
