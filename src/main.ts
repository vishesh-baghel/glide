import { Probot } from "probot";
import connectDb from "./dbConnection";
import listeningForAppInstallationEvents from "./listeners/appInstallationListener";
import configs from "./configs/fetch.configs.json";
import { fetchDetailsWithInstallationId, fetchDetails } from "./fetch";

type repository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
};

function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  listeningForAppInstallationEvents(app)
    .then((data: any) => {
      const { repositories, installation } = data;
      const repos: [repository] = repositories;
      const installationId: number = installation.id;

      // Confirmed from https://github.com/orgs/community/discussions/24509
      const owner = installation.account.login;

      repos.forEach((repo) => {
        fetchDetailsWithInstallationId(
          app,
          installationId,
          configs.all_issues.endpoint,
          {
            owner: owner,
            repo: repo.name,
            // state: configs.all_issues.state_closed,
            // labels: configs.all_issues.label_bug,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        )
          .then((response: any) => {
            app.log.info(response);
            const data = response.data;
            data.forEach((obj: any) => {
              app.log.info(`Issue title ${obj.title}`);
            });
          })
          .catch((error: any) => {
            app.log.error(error);
          });
      });
    })
    .catch((error: any) => {
      app.log.error("Error while processing app installation event");
      throw error;
    });

  fetchDetails(app, configs.endpoints.get_issue, {
    owner: "vishesh-baghel",
    repo: "glide",
    issue_number: 1,
  }).then((data: any) => {
    // app.log.info(data);
  });
}

export default main;
