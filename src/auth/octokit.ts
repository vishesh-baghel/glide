import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

const token = process.env.GITHUB_ACCESS_TOKEN;
const appId = process.env.APP_ID;
const privateKey = process.env.PRIVATE_KEY;

export function getOctokitInstance(): Octokit {
  return new Octokit({
    auth: token,
  });
}

export function getOctokitWithInstallationId(installationId: number): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appId,
      privateKey: privateKey,
      installationId: installationId,
    },
  });
}
