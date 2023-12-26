import { Probot } from "probot";

export function listeningForAppInstallationEvents(app: Probot, events: any[]) {
  return new Promise((resolve, reject) => {
    try {
      app.log.info("Listening for app installation events");

      app.on(events, async (context) => {
        app.log.info("Received an app installation event");

        resolve(context.payload);
      });
    } catch (error) {
      app.log.error(
        "Error occurred while listening for app installation events"
      );
      reject(error);
    }
  });
}
