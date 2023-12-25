import { Probot } from "probot";
import configs from "../configs/fetch.configs.json";
import { fetchDetailsWithInstallationId } from "./fetch";
import Commit from "../types/Commit";
import { getTimeStampOlderThanMonths } from "../utils";

export async function getAllCommits(
  app: Probot,
  installationId: number,
  owner: string,
  repoName: string,
  filePath: string
): Promise<Commit[]> {
  try {
    const commitAge = getTimeStampOlderThanMonths(3);

    const response: any = await fetchDetailsWithInstallationId(
      app,
      installationId,
      configs.all_commits.endpoint,
      {
        owner: owner,
        repo: repoName,
        sha: configs.all_commits.default_branch,
        path: filePath,
        since: commitAge,
      }
    );

    const commits: object[] = [...response.data];
    const commitList: Commit[] = commits.map((commitObj: any) => ({
      sha: commitObj.sha,
      message: commitObj.commit.message,
      date: commitObj.commit.committer.date,
    }));

    app.log.info(
      `Fetched total ${commitList.length} commits for installation id: ${installationId}`
    );

    return commitList;
  } catch (error: any) {
    app.log.error(
      `Error while fetching all commits for ${owner}/${repoName} and installation id: ${installationId}`
    );
    app.log.error(error);
    return [];
  }
}
