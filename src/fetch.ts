import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";
import { Probot } from "probot";
import { App, createNodeMiddleware } from "@octokit/app";

const authToken = process.env.GITHUB_ACCESS_TOKEN;
const privateKey = process.env.PRIVATE_KEY;
const appId = process.env.APP_ID;

const octokit = new Octokit({
  auth: authToken,
  userAgent: "glide-bot v1.0.0",
  previews: ["jean-grey", "symmetra"],
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
});

// const app = new App({
//   appId: 123,
//   privateKey: privateKey,
//   oauth: {
//     clientId: "0123",
//     clientSecret: "0123secret",
//   },
//   webhooks: {
//     secret: "secret",
//   },
// });

// const { data } = await app.octokit.request("/app");
// console.log("authenticated as %s", data.name);
// for await (const { installation } of app.eachInstallation.iterator()) {
//   for await (const { octokit, repository } of app.eachRepository.iterator({
//     installationId: installation.id,
//   })) {
//     await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
//       owner: repository.owner.login,
//       repo: repository.name,
//       event_type: "my_event",
//     });
//   }
// }

// app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
//   await octokit.request(
//     "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
//     {
//       owner: payload.repository.owner.login,
//       repo: payload.repository.name,
//       issue_number: payload.issue.number,
//       body: "Hello World!",
//     }
//   );
// });

// app.oauth.on("token", async ({ token, octokit }) => {
//   const { data } = await octokit.request("GET /user");
//   console.log(`Token retrieved for ${data.login}`);
// });

// require("http").createServer(createNodeMiddleware(app)).listen(3000);
// // can now receive requests at /api/github/*

const octokitAppAuth = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: appId,
    privateKey: privateKey,
    // installationId:
  },
});

// async function fetchDetails(app: Probot, endpoint: String): Promise<> {
//   try {
//     app.log.info("fetching details for resource endpoint: " + endpoint);
//     const { data } = await octokitAppAuth.request();

//     return data;
//   } catch (err: any) {
//     app.log.error({
//       message: `Error while fetching resource details for resource url: ${endpoint}`,
//     });
//     app.log.error(err);
//   }
// }
