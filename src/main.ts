import { Probot } from "probot";
import { connectDb } from "./db/dbConnection";
import { listeningForAppInstallationEvents } from "./listeners/appInstallationListener";
import { fetchDetailsWithInstallationId } from "./fetch/fetchBase";
import { processRepositories } from "./processing/processRepositories";
import { listeningForPullRequestEvents } from "./listeners/pullRequestListener";
import { getAllFilesFromPullRequest } from "./fetch/getAllFiles";
import configs from "./configs/fetch.configs.json";
import { GithubResponseFile } from "./types/GithubResponseFile";
import { File } from "./db/models/File";

export async function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  processAppInstallationEvents(app);

  processPullRequestEvents(app);

  fetchDetailsWithInstallationId(
    app,
    45426396,
    configs.all_files.endpoint_pull_request,
    {
      owner: "vishesh-baghel",
      repo: "code-review-bot",
      pull_number: 2,
    }
  )
    .then((response: any) => {
      type ResponseFile = {
        sha: string;
        filePath: string;
        status: string;
      };
      const data: any[] = response.data;

      const files: ResponseFile[] = data.map((file: any) => ({
        sha: file.sha,
        filePath: file.filename,
        status: file.status,
      }));

      // app.log.info(files);
    })
    .catch((error: any) => {
      app.log.error(error);
    });
}

function processAppInstallationEvents(app: Probot) {
  listeningForAppInstallationEvents(app)
    .then((response: any) => processRepositories(app, response))
    .catch((error: any) => {
      app.log.error("Error while processing app installation event");
      app.log.error(error);
    });
}

function processPullRequestEvents(app: Probot) {
  listeningForPullRequestEvents(app)
    .then((context: any) => processPullRequests(app, context.payload))
    .catch((error: any) => {
      app.log.error("Error while processing pull request events");
      app.log.error(error);
    });
}

async function processPullRequests(app: Probot, response: any) {
  const { pull_request, installation } = response;
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

  type FileScoreMap = {
    fileName: string;
    score: number;
  };

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

  return fileScoreMap;
}
