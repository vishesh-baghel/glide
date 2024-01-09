// install with: npm install @octokit/webhooks
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { getProbotInstance } from "../utils";
import EventSource from "eventsource";

const { WEBHOOK_SECRET } = process.env;
const app = getProbotInstance();

export function recieveGithubWebhooks() {
  app.log.info("listening to webhook events");
  if (WEBHOOK_SECRET === undefined) {
    app.log.error("Webhook secret is undefined. Cannot received webhooks");
    return;
  }

  const webhooks = new Webhooks({
    secret: WEBHOOK_SECRET,
  });

  webhooks.onAny(({ id, name, payload }) => {
    app.log.info("inside the listener");
    app.log.info(`${id}/${name}`);
    app.log.info(payload);
  });

  require("http").createServer(createNodeMiddleware(webhooks)).listen(3001);
}

export function receiveGithubEvents(): Promise<Webhooks> {
  const webhookProxyUrl = "https://smee.io/HQ7QNBCix9HCl6sL";
  const source = new EventSource(webhookProxyUrl);

  return new Promise((resolve, reject) => {
    if (WEBHOOK_SECRET === undefined) {
      app.log.error("Webhook secret is undefined. Cannot receive webhooks");
      reject("Webhook secret is undefined");
      return;
    }

    const webhooks: Webhooks = new Webhooks({
      secret: WEBHOOK_SECRET,
    });

    source.onmessage = (event) => {
      app.log.info("received an event");
      const webhookEvent = JSON.parse(event.data);

      webhooks
        .verifyAndReceive({
          id: webhookEvent["x-request-id"],
          name: webhookEvent["x-github-event"],
          signature: webhookEvent["x-hub-signature"],
          payload: JSON.stringify(webhookEvent.body),
        })
        .then(() => {
          resolve(webhooks);
        })
        .catch((error: any) => {
          app.log.info(error);
          reject(error);
        });
    };

    source.onerror = (error) => {
      app.log.error("Error with the EventSource:");
      app.log.error(error);
      reject(error);
    };
  });
}
