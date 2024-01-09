import { Probot } from "probot";
import { FileType } from "./types/FileType";
import { Commit } from "./types/Commit";
import { getAllCommits } from "./fetch/fetchCommits";
import { calculateRiskScore } from "./services/riskScoreService";
import { TrainingFileType } from "./types/TrainingFileType";
import { JobName, JobStatus } from "./db/models/Job";
import { Job } from "./types/Job";

export function getTimeDifference(date: Date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 1;
  }
  const currentTime = new Date();
  const difference: number = currentTime.getTime() - date.getTime();
  const scalingFactor = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const normalizedDifference = difference / scalingFactor;

  return normalizedDifference;
}

export function getTimeStampOlderThanMonths(monthsToReduce: number): string {
  let currentTime = new Date();
  currentTime.setMonth(currentTime.getMonth() - monthsToReduce);
  return currentTime.toISOString();
}

/**
 * For updation, we would need to recalculate the risk scores,
 * For creation, we would need to calculate the scores for the first time.
 * @param app
 * @param filePath
 * @param installationId
 * @param owner
 * @param repoName
 * @param defaultBranch
 * @returns
 */
export async function createFileTypeObject(
  app: Probot,
  filePath: string,
  installationId: number,
  owner: string,
  repoName: string,
  defaultBranch: string
): Promise<FileType> {
  const commits: Commit[] = await getAllCommits(
    app,
    installationId,
    owner,
    repoName,
    defaultBranch,
    filePath
  );
  const riskScore = calculateRiskScore(app, commits);
  // This score will be updated by the scheduled job
  const predictedRiskScore = 0;

  return {
    installationId,
    owner,
    repoName,
    filePath,
    commits,
    riskScore,
    predictedRiskScore,
  };
}

export function createTrainingFileTypeObject(file: FileType): TrainingFileType {
  return {
    installationId: file.installationId,
    owner: file.owner,
    repoName: file.repoName,
    filePath: file.filePath,
    numberOfCommits: file.commits.length,
    riskScore: file.riskScore,
  };
}

export function createJobTypeObject(
  file: FileType,
  jobName: JobName,
  status: JobStatus
): Job {
  return {
    jobName: jobName,
    parameters: {
      installationId: file.installationId,
      owner: file.owner,
      repoName: file.repoName,
      filePath: file.filePath,
    },
    status: status,
    scheduledAt: new Date(),
  };
}
