import { Octokit } from "octokit";
import { RequestParameters } from "@octokit/types";
import { Probot } from "probot";
import { createAppAuth } from "@octokit/auth-app";
import { error } from "console";

const token = process.env.GITHUB_ACCESS_TOKEN;
const appId = process.env.APP_ID;
const privateKey = process.env.PRIVATE_KEY;

const octokitApp = new Octokit({
  auth: token,
});

function fetchDetailsWithInstallationId(
  app: Probot,
  installationId: number,
  endpoint: string,
  parameters: RequestParameters
) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appId,
      privateKey: privateKey,
      installationId: installationId,
    },
  });

  return new Promise(async (resolve, reject) => {
    try {
      app.log.info("fetching details for resource endpoint: " + endpoint);
      const data = await octokit.request(endpoint, parameters);

      resolve(data);
    } catch (err: any) {
      app.log.error(
        `Error while fetching resource details for resource url: ${endpoint}`
      );
      reject(error);
    }
  });
}

function fetchDetails(
  app: Probot,
  endpoint: string,
  parameters: RequestParameters
) {
  return new Promise(async (resolve, reject) => {
    try {
      app.log.info("fetching details for resource endpoint: " + endpoint);
      const data = await octokitApp.request(endpoint, parameters);

      resolve(data);
    } catch (err: any) {
      app.log.error(
        `Error while fetching resource details for resource url: ${endpoint}`
      );
      reject(err);
    }
  });
}

export { fetchDetails, fetchDetailsWithInstallationId };

// const octokit = new Octokit({
//   auth: "YOUR-TOKEN",
// });

// await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
//   owner: "OWNER",
//   repo: "REPO",
//   pull_number: "PULL_NUMBER",
//   headers: {
//     "X-GitHub-Api-Version": "2022-11-28",
//   },
// });

// // Octokit.js
// // https://github.com/octokit/core.js#readme
// const octokit = new Octokit({
//   auth: "YOUR-TOKEN",
// });

// await octokit.request("GET /repos/{owner}/{repo}/commits", {
//   owner: "OWNER",
//   repo: "REPO",
//   headers: {
//     "X-GitHub-Api-Version": "2022-11-28",
//   },
// });

// // Octokit.js
// // https://github.com/octokit/core.js#readme
// const octokit = new Octokit({
//   auth: "YOUR-TOKEN",
// });

// await octokit.request(
//   "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
//   {
//     owner: "OWNER",
//     repo: "REPO",
//     issue_number: "ISSUE_NUMBER",
//     headers: {
//       "X-GitHub-Api-Version": "2022-11-28",
//     },
//   }
// );

// Octokit.js
// https://github.com/octokit/core.js#readme
// const octokit = new Octokit({
//   auth: "YOUR-TOKEN",
// });

// await octokit.request("GET /repos/{owner}/{repo}/issues", {
//   owner: "OWNER",
//   repo: "REPO",
//   headers: {
//     "X-GitHub-Api-Version": "2022-11-28",
//   },
// });
