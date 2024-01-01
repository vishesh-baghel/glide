import { Probot } from "probot";
import MindsDB, {
  Database,
  JsonValue,
  Model,
  TrainingOptions,
} from "mindsdb-js-sdk";

const {
  MINDSDB_HOST,
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_PORT,
  MONGODB_CONNECTION_STRING,
  MONGODB_DATABASE,
} = process.env;

const databaseName = "mongo_datasource";
const projectName = "mindsdb";
const predictorName = "riskscore_predictor";
const aggregationQuery = `test.trainingfiles.find({})`;

export async function retrainModel(app: Probot) {
  trainModel(app);
}

async function connectToMindsDB() {
  await MindsDB.connect({
    user: "",
    password: "",
    host: MINDSDB_HOST,
  });
}

async function trainModel(app: Probot) {
  try {
    app.log.info(`Started training the model: [${predictorName}]`);
    const dbList: Database[] = await MindsDB.Databases.getAllDatabases();
    const dbNames: string[] = dbList.map((db: Database) => db.name);

    if (!dbNames.includes(databaseName)) {
      const db: Database | undefined = await createDatabase(app);
      app.log.info(`Created database: ${db?.name} in mindsdb successfully`);
    }

    const regressionTrainingOptions: TrainingOptions = {
      select: aggregationQuery,
      integration: databaseName,
      orderBy: "createdAt",
      groupBy: "installationId",
      window: 100, // How many rows in the past to use when making a future prediction.
      horizon: 10, // How many rows in the future to forecast.
    };

    let predictionModel: Model | undefined = await MindsDB.Models.trainModel(
      predictorName,
      "riskScore",
      projectName,
      regressionTrainingOptions
    );

    const intervalId = setInterval(async () => {
      predictionModel = await MindsDB.Models.getModel(
        predictorName,
        projectName
      );

      if (predictionModel?.active) {
        app.log.info("Prediction model is active");
        clearInterval(intervalId);
      }
    }, 2000);

    app.log.info(`training completed for [${predictorName}]`);
  } catch (error: any) {
    app.log.error("Error while training the model");
    app.log.error(error);
  }
}

async function createDatabase(app: Probot): Promise<Database | undefined> {
  if (
    MONGODB_USER === undefined ||
    MONGODB_PASSWORD === undefined ||
    MONGODB_PORT === undefined ||
    MONGODB_CONNECTION_STRING === undefined ||
    MONGODB_DATABASE === undefined
  ) {
    app.log.error(
      `MindsDB environment values are undefined: DB:${MONGODB_DATABASE}, USER:${MONGODB_USER}, PASSWORD: ${MONGODB_PASSWORD}, PORT: ${MONGODB_PORT}, HOST: ${MONGODB_CONNECTION_STRING}`
    );
    return;
  }

  const connectionParams: Record<string, JsonValue> = {
    username: MONGODB_USER,
    password: MONGODB_PASSWORD,
    port: MONGODB_PORT,
    host: MONGODB_CONNECTION_STRING,
    database: MONGODB_DATABASE,
  };

  try {
    const mongoDB: Database = await MindsDB.Databases.createDatabase(
      databaseName,
      "mongodb",
      connectionParams
    );

    return mongoDB;
  } catch (error: any) {
    app.log.error("Error while creating database in mindsdb");
    throw error;
  }
}
