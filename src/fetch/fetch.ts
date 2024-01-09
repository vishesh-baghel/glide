import { RequestParameters } from "@octokit/types";
import { Probot } from "probot";
import {
  getOctokitInstance,
  getOctokitWithInstallationId,
} from "../auth/octokit";

export function fetchDetailsWithInstallationId(
  app: Probot,
  installationId: number,
  endpoint: string,
  parameters: RequestParameters
) {
  return new Promise(async (resolve, reject) => {
    try {
      const octokit = getOctokitWithInstallationId(installationId);
      const data = await octokit.request(endpoint, parameters);

      resolve(data);
    } catch (err: any) {
      app.log.error(
        `Error while fetching resource details for resource url: [${endpoint}]`
      );
      reject(err);
    }
  });
}

export function fetchDetails(
  app: Probot,
  endpoint: string,
  parameters: RequestParameters
) {
  return new Promise(async (resolve, reject) => {
    try {
      const octokit = getOctokitInstance();
      const data = await octokit.request(endpoint, parameters);

      resolve(data);
    } catch (err: any) {
      app.log.error(
        `Error while fetching resource details for resource url: [${endpoint}]`
      );
      reject(err);
    }
  });
}
