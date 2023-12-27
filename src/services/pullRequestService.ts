import { Probot } from "probot";
import { getAllFilesFromPullRequest } from "../fetch/getAllFiles";
import { GithubResponseFile } from "../types/GithubResponseFile";
import { File } from "../db/models/File";
import { FileScoreMap } from "../types/FileScoreMap";

export async function processPullRequests(app: Probot, payload: any) {
  const { pull_request, installation } = payload;
  const pullNumber: number = pull_request.number;

  // todo: thinking how to use them
  // const mainBranchRef: string = pull_request.base.ref;
  // const mainBranchSha: string = pull_request.base.sha;
  const repoFullName: string = pull_request.base.repo.full_name;
  const installationId: number = installation.id;

  const fullName = repoFullName.split("/");
  const owner = fullName[0];
  const repoName = fullName[1];

  const responseFiles: GithubResponseFile[] = await getAllFilesFromPullRequest(
    app,
    owner,
    repoName,
    installationId,
    pullNumber
  );

  const fileScoreMap: FileScoreMap[] = await Promise.all(
    responseFiles.map(async (file: GithubResponseFile, index) => {
      const scores: number[] | null = await File.findOne(
        {
          installationId: installationId,
          owner: owner,
          repoName: repoName,
          filePath: file.filePath,
        },
        "riskScore"
      );

      if (scores == null) {
        return {
          fileName: file.filePath,
          score: 0,
        };
      }

      return {
        fileName: file.filePath,
        score: scores[index],
      };
    })
  );

  app.log.info(`Fetched total ${fileScoreMap.length} files from the DB`);

  return fileScoreMap;
}
