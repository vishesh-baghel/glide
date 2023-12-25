import { Probot } from "probot";
import connectDb from "./db/dbConnection";
import listeningForAppInstallationEvents from "./listeners/appInstallationListener";
import configs from "./configs/fetch.configs.json";
import { fetchDetails } from "./fetch/fetch";
import { processRepositories } from "./processing/processRepositories";

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

export default main;
