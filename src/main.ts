import { Probot } from "probot";
import { connectMongoDB } from "./db/mongodbConnection";
import { fetchDetails, fetchDetailsWithInstallationId } from "./fetch/fetch";
import { processRepositories } from "./services/repositoryService";
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
import { connectMindsDB } from "./db/mindsdbConnection";
import {
  retrainPredictorModel,
  trainPredictorModel,
} from "./services/predictionService";
import {
  errorFallbackCommentForPRClosedEvent,
  errorFallbackCommentForPROpenEvent,
} from "./constants/Comments";
import { predictedScoresUpdationScheduler } from "./schedulers/predictedScoreScheduler";
import { getProbotInstance } from "./auth";

const app = getProbotInstance();
const debugFlag: boolean = false;

export async function main(probotApp: Probot) {
  try {
    connectMongoDB().catch((error: any) => app.log.error(error));
    connectMindsDB().catch((error: any) => app.log.error(error));
    handleAppInstallationCreatedEvents(probotApp);
    handlePullRequestOpenEvents(probotApp);
    handlePullRequestClosedEvents(probotApp);
    trainPredictorModel();
    predictedScoresUpdationScheduler();
    debug();
  } catch (error: any) {
    app.log.error("Error occured in main function");
    app.log.error(error);
  }
}

function handleAppInstallationCreatedEvents(app: Probot) {
  const events: any[] = [eventConfigs.app_installation.created];

  app.on(events, (context: any) => {
    app.log.info(
      `Received an event with event id: ${context.id}, name: ${context.name} and action: ${context.payload.action}`
    );
    processRepositories(app, context.payload).catch((error: any) => {
      app.log.error("Error while processing app installation event");
      app.log.error(error);
    });
  });
}

function handlePullRequestOpenEvents(app: Probot) {
  const events: any[] = [eventConfigs.pull_request.opened];

  app.on(events, async (context: any) => {
    app.log.info(
      `Received an event with event id: ${context.id}, name: ${context.name} and action: ${context.payload.action}`
    );
    try {
      const files: FileScoreMap[] = await processPullRequestOpenEvent(
        app,
        context.payload
      );
      const comment = await constructComment(app, files);
      createCommentOnGithub(app, comment, context);
    } catch (error: any) {
      app.log.error("Error while processing pull request opened event");
      app.log.error(error);
      const comment: string = errorFallbackCommentForPROpenEvent();
      createCommentOnGithub(app, comment, context);
    }
  });
}

function handlePullRequestClosedEvents(app: Probot) {
  const events: any[] = [eventConfigs.pull_request.closed];

  app.on(events, async (context: any) => {
    app.log.info(
      `Received an event with event id: ${context.id}, name: ${context.name} and action: ${context.payload.action}`
    );
    try {
      const areFilesUpdated: boolean = await updateFilesInDb(
        app,
        context.payload
      );
      if (areFilesUpdated) {
        const comment =
          "Risk scores are updated for all the files modified in this pull request.";
        createCommentOnGithub(app, comment, context);
      }
      retrainPredictorModel(app);

      return context;
    } catch (error: any) {
      app.log.error("Error while processing pull request closed event");
      app.log.error(error);
      const comment = errorFallbackCommentForPRClosedEvent();
      createCommentOnGithub(app, comment, context);
    }
  });
}

function debug() {
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

    app.log.info(`false: ${isValidFilePath("src/setupTests.ts")}`);
  }
}
