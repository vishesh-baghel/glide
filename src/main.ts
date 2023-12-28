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
import {
  processPullRequestOpenEvent,
  updateFilesInDb,
} from "./services/pullRequestService";
import { FileScoreMap } from "./types/FileScoreMap";
import { isValidFilePath } from "./fetch/fetchFiles";

const debugFlag: boolean = false;

export async function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  handleAppInstallationCreatedEvents(app);

  handlePullRequestOpenEvents(app);

  handlePullRequestClosedEvents(app);

  if (debugFlag === true) {
    fetchDetails(app, "GET /repos/{owner}/{repo}", {
      owner: "vishesh-baghel",
      repo: "lombok",
    }).then((response: any) => {
      app.log.info(response);
    });

    fetchDetailsWithInstallationId(
      app,
      45486421,
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
        app.log.info(files);
      })
      .catch((error: any) => {
        app.log.error(error);
      });
  }

  app.log.info(`false: ${isValidFilePath("src/setupTests.ts")}`);
}

function handleAppInstallationCreatedEvents(app: Probot) {
  const events: any[] = [eventConfigs.app_installation.created];

  listeningForAppInstallationEvents(app, events)
    .then((response: any) => processRepositories(app, response))
    .catch((error: any) => {
      app.log.error("Error while processing app installation event");
      app.log.error(error);
    });
}

function handlePullRequestOpenEvents(app: Probot) {
  const events: any[] = [eventConfigs.pull_request.opened];

  listeningForPullRequestEvents(app, events)
    .then(async (context: any) => {
      app.log.info("Received an pull request opened event");
      const files: FileScoreMap[] = await processPullRequestOpenEvent(
        app,
        context.payload
      );
      const comment = await constructComment(app, files);
      createCommentOnGithub(app, comment, context);
    })
    .catch((error: any) => {
      app.log.error("Error while processing pull request opened event");
      app.log.error(error);
    });
}

function handlePullRequestClosedEvents(app: Probot) {
  const events: any[] = [eventConfigs.pull_request.closed];

  listeningForPullRequestEvents(app, events)
    .then(async (context: any) => {
      app.log.info("Received an pull request closed event");
      const areFilesUpdated: boolean = await updateFilesInDb(
        app,
        context.payload
      );

      if (areFilesUpdated) {
        const comment =
          "Risk scores are updated for all the files modified in this pull request.";
        createCommentOnGithub(app, comment, context);
      }
    })
    .catch((error: any) => {
      app.log.error("Error while processing pull request closed event");
      app.log.error(error);
    });
}
