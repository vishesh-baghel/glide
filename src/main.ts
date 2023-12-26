import { Probot } from "probot";
import { connectDb } from "./db/dbConnection";
import { listeningForAppInstallationEvents } from "./listeners/appInstallationListener";
import {
  fetchDetails,
  fetchDetailsWithInstallationId,
} from "./fetch/fetchBase";
import { processRepositories } from "./services/repositoryService";
import { listeningForPullRequestEvents } from "./listeners/pullRequestListener";
import configs from "./configs/fetch.configs.json";
import eventConfigs from "./configs/github.webhook.event.configs.json";
import {
  constructComment,
  createCommentOnGithub,
} from "./services/commentService";
import { processPullRequests } from "./services/pullRequestService";
import { FileScoreMap } from "./types/FileScoreMap";
import { Align, getMarkdownTable } from "markdown-table-ts";

const checkRateLimit: boolean = false;

export async function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  processAppInstallationEvents(app);

  processPullRequestEvents(app);

  if (checkRateLimit === true) {
    fetchDetails(app, configs.endpoints.rate_limit, {}).then(
      (response: any) => {
        app.log.info(response);
      }
    );
  }

  fetchDetails(app, configs.all_files.endpoint_pull_request, {
    owner: "vishesh-baghel",
    repo: "code-review-bot",
    pull_number: 2,
  })
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

      const table = getMarkdownTable({
        table: {
          head: ["File Name", "File status"],
          body: [["1"], ["2", "Bob", "25"], ["3", "Alice", "23"]],
        },
        alignment: [Align.Left, Align.Left, Align.Left],
      });
      const comment = files.map((file: ResponseFile) => {
        return getMarkdownTable({
          table: {
            head: ["File Name", "File status"],
            body: [[`${file.filePath}`, `${file.status}`]],
          },
        });
      });
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
      const comment = await constructComment(app, files);
      createCommentOnGithub(app, comment, context);
    })
    .catch((error: any) => {
      app.log.error("Error while processing pull request events");
      app.log.error(error);
    });
}
