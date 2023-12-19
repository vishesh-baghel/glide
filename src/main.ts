import { Probot } from "probot";
import connectDb from "./dbConnection";

function main(app: Probot) {
  connectDb(app)
    .then((db) => {
      app.log.info(db);
    })
    .catch(() => {
      app.log.error("Error while connecting to the database");
    });
}

export default main;
