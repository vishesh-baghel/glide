import { Probot } from "probot";

export function listeningForGithubWebhookEvents(app: Probot, events: any[]) {
  return new Promise((resolve, reject) => {
    try {
      app.log.info(`Listening for ${events} events`);

      app.on(events, async (context) => {
        resolve(context);
      });
    } catch (error) {
      app.log.error(`Error occurred while listening for ${events} events`);
      reject(error);
    }
  });
}
