import { Probot } from "probot";
import connectDb from "./dbConnection";
import listeningForAppInstallationEvents from "./listeners/appInstallationListener";
import configs from "./configs/fetch.configs.json";
import { fetchDetailsWithInstallationId, fetchDetails } from "./fetch";
import File from "./types/File";
import Commit from "./types/Commit";

type repository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
};

async function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  processAppInstallations(app);

  fetchDetails(app, configs.all_commits.endpoint, {
    owner: "war-hammer-fan",
    repo: "email-app",
    sha: "main",
    path: "src/App.tsx",
  })
    .then((response: any) => {
      const commits: object[] = [...response.data];
      const newCommits = commits.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.committer.date,
      }));
      app.log.info(newCommits);
    })
    .catch((error: any) => {
      app.log.error(error);
    });
}

function processAppInstallations(app: Probot) {
  app.log.info("Received the request to process app installations");
  listeningForAppInstallationEvents(app)
    .then((response: any) => processRepositories(app, response))
    .catch((error: any) => {
      app.log.error("Error while processing app installation event");
      app.log.error(error);
    });
}

async function processRepositories(app: Probot, response: any) {
  const { repositories, installation } = response;
  const repos: any[] = repositories;
  const installationId: number = installation.id;

  // Confirmed from https://github.com/orgs/community/discussions/24509
  const owner = installation.account.login;

  app.log.info(`Started the processing of repositories for ${installationId}`);

  await Promise.all(
    repos.map(async (repo) => {
      try {
        app.log.info(`Started processing repository: ${repo.name}`);

        const fileNames: File[] = await getAllFiles(
          app,
          installationId,
          owner,
          repo.name
        );

        app.log.info(
          `Received Total ${fileNames.length} files for processing from repository: ${owner}/${repo.name} with installation id: ${installationId}`
        );

        const commitsPromises = fileNames.map((file) => {
          // app.log.info(
          //   `Before going to get all commits: ${owner} ${repo.name} ${file.path}`
          // );
          return getAllCommits(
            app,
            installationId,
            owner,
            repo.name,
            file.path
          );
        });

        const allCommits = await Promise.all(commitsPromises);

        app.log.info(allCommits);
      } catch (error: any) {
        app.log.error(error);
      }
    })
  );
}

async function getAllFiles(
  app: Probot,
  installationId: number,
  owner: string,
  repoName: string
): Promise<File[]> {
  try {
    const response: any = await fetchDetailsWithInstallationId(
      app,
      installationId,
      configs.all_files.endpoint,
      {
        owner: owner,
        repo: repoName,
        tree_sha: configs.all_files.default_branch,
        recursive: true,
      }
    );

    const files: any[] = [...response.data.tree];
    const filePaths: File[] = files.map((file: any) => ({
      path: file.path,
    }));

    app.log.info(
      `Total ${filePaths.length} files fetched from repository: ${owner}/${repoName} for installation id: ${installationId}`
    );

    return filePaths;
  } catch (error: any) {
    app.log.error(
      `Error occurred while fetching all files for ${owner}/${repoName} and installation id: ${installationId}`
    );
    app.log.error(error);
    return [];
  }
}

async function getAllCommits(
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

    if (commitList.length === 0) {
      app.log.error(`Failed to find commits after ${commitAge}`);
      return [];
    }

    return commitList;
  } catch (error: any) {
    app.log.error(
      `Error while fetching all commits for ${owner}/${repoName} and installation id: ${installationId}`
    );
    app.log.error(error);
    return [];
  }
}

function getTimeStampOlderThanMonths(monthsToReduce: number): string {
  let currentTime = new Date();
  currentTime.setMonth(currentTime.getMonth() - monthsToReduce);
  return currentTime.toISOString();
}

export default main;
