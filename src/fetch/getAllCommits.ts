import { Probot } from "probot";
import configs from "../configs/fetch.configs.json";
import { fetchDetailsWithInstallationId } from "./fetchBase";
import { Commit } from "../types/Commit";
import { getTimeStampOlderThanMonths } from "../utils";

const bugRegex = new RegExp(
  ".*\\b([Bb]ug(s|gy|ged)?|[Fixf]ix(es|ed|ing)?|[Closec]lose(s|d|ing)?|[ResolveRr]esolve(s|d|ing)?|[AddressAa]ddress(es|ed|ing)?).*"
);

export async function getAllCommits(
  app: Probot,
  installationId: number,
  owner: string,
  repoName: string,
  filePath: string
): Promise<Commit[]> {
  try {
    const commitAge = getTimeStampOlderThanMonths(
      configs.all_commits.commit_age
    );
    const pageSize = configs.all_commits.page_size;
    let page = 1;
    let allCommits: Commit[] = [];

    while (true) {
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
          per_page: pageSize,
          page: page,
        }
      );

      const commits: object[] = [...response.data];
      const commitList: Commit[] = commits
        .map((commitObj: any) => ({
          sha: commitObj.sha,
          message: commitObj.commit.message,
          date: commitObj.commit.committer.date,
        }))
        .filter((commit: Commit) => commit.message.match(bugRegex));

      allCommits = allCommits.concat(commitList);

      if (commitList.length < pageSize) {
        break;
      }

      page++;
    }

    app.log.info(
      `Total ${allCommits.length} commits are eligible for calculating risk score from ${owner}/${repoName} with installation id: ${installationId}`
    );

    return allCommits;
  } catch (error: any) {
    app.log.error(
      `Error while fetching all commits for ${owner}/${repoName} and installation id: ${installationId}`
    );
    app.log.error(error);
    throw error;
  }
}
