import { Probot } from "probot";
import connectDb from "./dbConnection";
import listeningForAppInstallationEvents from "./listeners/appInstallationListener";

function main(app: Probot) {
  connectDb(app)
    .then((db) => {
      app.log.info(db);
    })
    .catch((error: any) => {
      app.log.error(error);
    });

  listeningForAppInstallationEvents(app).then((data: any) => {
    app.log.info(data);
  });
}

export default main;
