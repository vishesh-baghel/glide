import { Probot } from "probot";
import connectDb from "./dbConnection";
import listeningForAppInstallationEvents from "./listeners/appInstallationListener";
import fetchDetails from "./fetch";
import configs from "./configs/fetch.configs.json";

function main(app: Probot) {
  connectDb(app).catch((error: any) => {
    app.log.error(error);
  });

  listeningForAppInstallationEvents(app).then((data: any) => {
    app.log.info(data);
  });

  fetchDetails(app, configs.endpoints.all_issues, {
    owner: "ravgeetdhillon",
    repo: "dropilio",
  }).then((data: any) => {
    app.log.info(data);
  });
}

export default main;
