import { Octokit } from "octokit";
import { RequestParameters } from "@octokit/types";
import { Probot } from "probot";

const token = process.env.GITHUB_ACCESS_TOKEN;

const octokitApp = new Octokit({
  auth: token,
});

export default function fetchDetails(
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
