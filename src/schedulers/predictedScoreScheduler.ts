import { Probot } from "probot";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { JobModel, JobName, JobStatus } from "../db/models/Job";
import { Job } from "../types/Job";
import { batchQueryMindDB, queryMindDB } from "../services/predictionService";
import { getProbotInstance } from "../utils";
import { File } from "../db/models/File";
import { ModelPrediction } from "mindsdb-js-sdk";
import { FileType } from "../types/FileType";

const jobBatchSize = 1;
const intervalInMinutes = 5;
const scheduler = new ToadScheduler();

export function updatePredictedScoresScheduler(app: Probot) {
  try {
    const task = new AsyncTask("Update-predicted-scores", jobHandler);

    const job = new SimpleIntervalJob({ seconds: 10 }, task, {
      id: "job-1",
      preventOverrun: true,
    });

    scheduler.addSimpleIntervalJob(job);
  } catch (error: any) {
    app.log.error(error);
  }
}

const jobHandler = async () => {
  const app = getProbotInstance();
  try {
    const installationJobs = await JobModel.find({
      status: JobStatus.Incomplete,
      jobName: JobName.InstallationJob,
    }).limit(jobBatchSize);

    const fileUpdationJobs = await JobModel.find({
      status: JobStatus.Incomplete,
      jobName: JobName.FileUpdationJob,
    });

    const appInstallationJobPromises = handleAppInstallationJob(
      app,
      installationJobs
    );

    const fileUpdationJobPromises = handlePredictedScoreUpdationJob(
      app,
      fileUpdationJobs
    );

    await Promise.all([fileUpdationJobPromises, appInstallationJobPromises]);
    app.log.info(`Updated predicted scores to the DB successfully`);
    return "job complete";
  } catch (error: any) {
    app.log.error(`Error in jobHandler: ${error.message}`);
    throw error;
  }
};

function handleAppInstallationJob(app: Probot, jobs: Job[]) {
  return jobs.map(async (job: Job) => {
    return batchQueryMindDB(app, job.parameters.installationId)
      .then((files: FileType[]) => {
        files.forEach((file: FileType) => {
          const filter = {
            installationId: file.installationId,
            owner: file.owner,
            repoName: file.repoName,
            filePath: file.filePath,
          };
          const update = {
            predictedRiskScore: file.predictedRiskScore,
          };

          return Promise.all([
            File.updateOne(filter, update),
            JobModel.updateOne(filter, {
              status: JobStatus.Complete,
              completedAt: new Date(),
            }),
          ]);
        });
      })
      .catch((error: any) => {
        app.log.error(
          `Error while executing batch query on mindsdb: ${error.message}`
        );
        return Promise.reject(error);
      });
  });
}

function handlePredictedScoreUpdationJob(app: Probot, jobs: Job[]) {
  return jobs.map(async (job: Job) => {
    return queryMindDB(app, job)
      .then((prediction: ModelPrediction | undefined) => {
        if (prediction === undefined) {
          throw new Error("Predicted score is undefined");
        }

        const update = {
          predictedScore: prediction?.value,
        };

        return Promise.all([
          File.updateOne(job.parameters, update),
          JobModel.updateOne(job.parameters, {
            status: JobStatus.Complete,
            completedAt: new Date(),
          }),
        ]);
      })
      .catch((error: any) => {
        app.log.error(
          `Error while fetching predicted score from mindsdb: ${error.message}`
        );
        return Promise.reject(error);
      });
  });
}
