import { Webhooks } from "@octokit/webhooks";
import { Probot } from "probot";
import { WebhookAndContext } from "../main";

export function listeningForGithubWebhookEvents(
  app: Probot,
  events: any[],
  webhook: Webhooks
): Promise<WebhookAndContext> {
  return new Promise(() => {
    try {
      app.log.info(`Listening for ${events} events`);

      let context: any;
      app.on(events, (res: any) => {
        context = res;
      });
      webhook.on(events, (response: any) => {
        app.log.info(response);
        const data: WebhookAndContext = {
          context: context,
          webhook: response,
        };
        Promise.resolve(data);
      });
    } catch (error) {
      app.log.error(`Error occurred while listening for ${events} events`);
      Promise.reject(error);
    }
  });
}
