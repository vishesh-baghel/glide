import { Octokit } from "octokit";
import { RequestParameters } from "@octokit/types";
import { Probot } from "probot";
import { createAppAuth } from "@octokit/auth-app";

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
      const data = await octokit.request(endpoint, parameters);

      resolve(data);
    } catch (err: any) {
      app.log.error(
        `Error while fetching resource details for resource url: ${endpoint}`
      );
      reject(err);
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
