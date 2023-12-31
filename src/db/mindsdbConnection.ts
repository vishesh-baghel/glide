import MindsDB from "mindsdb-js-sdk";
import { Probot } from "probot";

export async function connectMindsDB(app: Probot) {
  return new Promise((resolve, reject) => {
    try {
      MindsDB.connect({
        user: "",
        password: "",
        host: "http://127.0.0.1:47334",
      });

      resolve(MindsDB);
    } catch (error: any) {
      app.log.error("Error while connecting to mindsdb");
      reject(error);
    }
  });
}

export async function getMindsDBInstance(app: Probot) {
  return await connectMindsDB(app);
}
