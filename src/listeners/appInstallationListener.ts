import { Probot } from "probot";
import configs from "../configs/github.webhook.event.configs.json";

export function listeningForAppInstallationEvents(app: Probot) {
  return new Promise((resolve, reject) => {
    try {
      app.log.info("Listening for app installation events");

      const events: any[] = [configs.app_installation.created];
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
