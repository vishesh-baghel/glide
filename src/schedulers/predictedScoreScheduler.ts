import { Probot } from "probot";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import { JobModel, JobStatus } from "../db/models/Job";
import { Job } from "../types/Job";
import { fetchFromMindDB } from "../services/predictionService";
import { getProbotInstance } from "../utils";
import { FileScoreMap } from "../types/FileScoreMap";

const jobBatchSize = 1000;
const intervalInMinutes = 5;
const scheduler = new ToadScheduler();

export function updatePredictedScoresScheduler(app: Probot) {
  const task = new AsyncTask(
    "Update-predicted-scores",
    jobHandler,
    (error: Error) => app.log.error(error)
  );

  const job = new SimpleIntervalJob({ seconds: intervalInMinutes * 60 }, task, {
    id: "job-1",
    preventOverrun: true,
  });

  scheduler.addSimpleIntervalJob(job);
}

const jobHandler = () => {
  return new Promise((resolve, reject) => {
    const app = getProbotInstance();
    JobModel.find({ status: JobStatus.Incomplete })
      .limit(jobBatchSize)
      .then(async (jobs: Job[]) => {
        const scores: FileScoreMap[] | any = await fetchFromMindDB(app, jobs);

        resolve("job complete");
      })
      .catch((error: any) => reject(error));
  });
};
