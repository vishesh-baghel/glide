import { Probot } from "probot";
import configs from "../configs/github.webhook.event.configs.json";

export function listeningForPullRequestEvents(app: Probot) {
  return new Promise((resolve, reject) => {
    try {
      app.log.info("Listening for pull request events");

      const events: any[] = [configs.pull_request.opened];
      app.on(events, async (context) => {
        app.log.info("Received an pull request event");

        resolve(context);
      });
    } catch (error) {
      app.log.error(
        "Error occurred while listening for app pull request events"
      );
      reject(error);
    }
  });
}
