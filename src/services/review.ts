import { getProbotInstance } from "../auth";
import { getAllContent } from "../fetch/fetchContent";
import { FileScoreMap } from "../types/File";

const app = getProbotInstance();

export async function generateReviews(
  files: FileScoreMap[],
  repoName: string,
  owner: string,
  pullRequestBranch: string
) {
  const fileContents = files.map(async (file) => {
    return {
      filePath: file.fileName,
      content: await getAllContent(
        owner,
        repoName,
        file.fileName,
        pullRequestBranch
      ),
    };
  });

  const fileCodes = await Promise.all(fileContents);
  app.log.info(fileCodes);
}
