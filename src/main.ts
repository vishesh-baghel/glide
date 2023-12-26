import { Probot } from "probot";
import { connectDb } from "./db/dbConnection";
import { listeningForAppInstallationEvents } from "./listeners/appInstallationListener";
import { fetchDetailsWithInstallationId } from "./fetch/fetchBase";
import { processRepositories } from "./services/repositoryService";
import { listeningForPullRequestEvents } from "./listeners/pullRequestListener";
import configs from "./configs/fetch.configs.json";
import eventConfigs from "./configs/github.webhook.event.configs.json";
import { createCommentOnGithub } from "./services/commentService";
import { processPullRequests } from "./services/pullRequestService";
import { FileScoreMap } from "./types/FileScoreMap";
import { markdownTable } from "markdown-table";

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

      // const comment = files.map((file: ResponseFile) => {
      //   return markdownTable([
      //     ["File Name", "Status"],
      //     [`${file.filePath}`, `${file.status}`],
      //   ]);
      // });
      // app.log.info(comment);
    })
    .catch((error: any) => {
      app.log.error(error);
    });
}

function processAppInstallationEvents(app: Probot) {
  const events: any[] = [eventConfigs.app_installation.created];

  listeningForAppInstallationEvents(app, events)
    .then((response: any) => processRepositories(app, response))
    .catch((error: any) => {
      app.log.error("Error while processing app installation event");
      app.log.error(error);
    });
}

function processPullRequestEvents(app: Probot) {
  const events: any[] = [eventConfigs.pull_request.opened];

  listeningForPullRequestEvents(app, events)
    .then(async (context: any) => {
      const files: FileScoreMap[] = await processPullRequests(
        app,
        context.payload
      );
      const comment = `File name ${files[0].fileName} with score: ${files[0].score}`;
      createCommentOnGithub(comment, context);
    })
    .catch((error: any) => {
      app.log.error("Error while processing pull request events");
      app.log.error(error);
    });
}
