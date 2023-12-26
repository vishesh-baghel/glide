import { Probot } from "probot";

export function listeningForPullRequestEvents(app: Probot, events: any[]) {
  return new Promise((resolve, reject) => {
    try {
      app.log.info("Listening for pull request events");

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
