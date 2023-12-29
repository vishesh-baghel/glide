import { Probot } from "probot";
import { getAllFilesFromPullRequest } from "../fetch/fetchFiles";
import { GithubResponseFile } from "../types/GithubResponseFile";
import { File } from "../db/models/File";
import { FileScoreMap } from "../types/FileScoreMap";
import { Commit } from "../types/Commit";
import { getAllCommits } from "../fetch/fetchCommits";
import { calculateRiskScore } from "./riskScoreService";
import { FileType } from "../types/File";
import { FileStatus } from "../constants/GithubContants";

export async function processPullRequestOpenEvent(
  app: Probot,
  payload: any
): Promise<FileScoreMap[]> {
  const { responseFiles, installationId, owner, repoName } =
    await extractFileDetailsFromPREventPayload(app, payload);

  let fileScoreMap: FileScoreMap[] = await createFileScoreMap(
    responseFiles,
    installationId,
    owner,
    repoName
  );
  app.log.info(`Fetched total ${fileScoreMap.length} files from the DB`);

  return fileScoreMap;
}

export async function updateFilesInDb(
  app: Probot,
  payload: any
): Promise<boolean> {
  try {
    const {
      isMerged,
      responseFiles,
      installationId,
      owner,
      repoName,
      defaultBranch,
      pullNumber,
    } = await extractFileDetailsFromPREventPayload(app, payload);

    // isMerged will only be true when a pull request is going to be
    // merged with the default branch
    if (!isMerged) {
      app.log.warn(
        `Files are not updated, because this pull request(ref: ${owner}/${repoName}/pulls/${pullNumber}) closed event is not being merged into default branch`
      );
      return false;
    }

    if (responseFiles.length === 0) {
      app.log.warn(
        `There are no files modified in the pull request with ref: ${owner}/${repoName}/pulls/${pullNumber} and installationId: ${installationId}`
      );
      return false;
    }

    const updateFileStatuses: FileStatus[] = [
      FileStatus.Modified,
      FileStatus.Changed,
    ];

    const addFileStatuses: FileStatus[] = [
      FileStatus.Added,
      FileStatus.Copied,
      FileStatus.Renamed,
    ];

    const removeFileStatuses: FileStatus[] = [FileStatus.Removed];

    responseFiles.forEach(async (responseFile: GithubResponseFile) => {
      if (updateFileStatuses.includes(responseFile.status)) {
        // update the files
        const file: FileType = await createFileTypeObject(
          app,
          responseFile.filePath,
          installationId,
          owner,
          repoName,
          defaultBranch
        );

        const filter = {
          installationId: file.installationId,
          owner: file.owner,
          repoName: file.repoName,
          filePath: file.filePath,
        };

        const update = {
          commits: file.commits,
          riskScore: file.riskScore,
        };

        await File.updateOne(filter, update);
      } else if (addFileStatuses.includes(responseFile.status)) {
        // create new files in the db
        const file: FileType = await createFileTypeObject(
          app,
          responseFile.filePath,
          installationId,
          owner,
          repoName,
          defaultBranch
        );

        await File.create(file);
      } else if (removeFileStatuses.includes(responseFile.status)) {
        const filter = {
          installationId: installationId,
          owner: owner,
          repoName: repoName,
          filePath: responseFile.filePath,
        };
        await File.deleteOne(filter);
      }
    });

    app.log.info(
      `Updated the files coming from pull request with ref: ${owner}/${repoName}/pulls/${pullNumber} successfully for installation id: ${installationId}`
    );

    return true;
  } catch (error: any) {
    throw error;
  }
}

async function extractFileDetailsFromPREventPayload(app: Probot, payload: any) {
  const { pull_request, installation, repository } = payload;
  const pullNumber: number = pull_request.number;
  const isMerged: boolean = pull_request.merged;
  const defaultBranch: string = repository.default_branch;

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

  return {
    isMerged,
    responseFiles,
    installationId,
    owner,
    pullNumber,
    repoName,
    defaultBranch,
  };
}

async function createFileScoreMap(
  responseFiles: GithubResponseFile[],
  installationId: number,
  owner: string,
  repoName: string
): Promise<FileScoreMap[]> {
  const fileScoreMap: FileScoreMap[] = await Promise.all(
    responseFiles.map(async (file: GithubResponseFile) => {
      const fileObject: FileType | null = await File.findOne(
        {
          installationId: installationId,
          owner: owner,
          repoName: repoName,
          filePath: file.filePath,
        },
        "riskScore"
      );

      if (fileObject === null) {
        return {
          fileName: file.filePath,
          score: 0,
        };
      }

      return {
        fileName: file.filePath,
        score: fileObject.riskScore,
      };
    })
  );

  return fileScoreMap;
}

/**
 * For updation, we would need to recalculate the risk scores,
 * For creation, we would need to calculate the scores for the first time.
 * This is the reason, we are reusing this function
 * @param app
 * @param filePath
 * @param installationId
 * @param owner
 * @param repoName
 * @param defaultBranch
 * @returns
 */
async function createFileTypeObject(
  app: Probot,
  filePath: string,
  installationId: number,
  owner: string,
  repoName: string,
  defaultBranch: string
): Promise<FileType> {
  const commits: Commit[] = await getAllCommits(
    app,
    installationId,
    owner,
    repoName,
    defaultBranch,
    filePath
  );
  const riskScore = calculateRiskScore(app, commits);

  return {
    installationId,
    owner,
    repoName,
    filePath,
    commits,
    riskScore,
  };
}
