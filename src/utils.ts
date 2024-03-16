import { Probot } from "probot";
import { FileType, TrainingFileType } from "./types/File";
import { Commit } from "./types/Commit";
import { getAllCommits } from "./fetch/fetchCommits";
import { calculateRiskScore } from "./services/riskScore";
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
/**
 * @param monthsToReduce number of months to reduce from current date
 * @returns returns the time stamp in ISO string
 */
export function getTimeStampOlderThanMonths(monthsToReduce: number): string {
  let currentTime = new Date();
  currentTime.setMonth(currentTime.getMonth() - monthsToReduce);
  return currentTime.toISOString();
}

/**
 * Creates a file object by fetching all the recent commits
 *
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

export function detectLanguage(filePath: string) {
  const javascriptExtensions = [".js", ".cjs", ".mjs"];
  const javaExtensions = [".java", ".class"];
  const cppExtensions = [".cpp", ".h", ".hpp", ".cc", ".cxx"];
  const goExtensions = [".go"];
  const phpExtensions = [".php"];
  const protoExtensions = [".proto"];
  const pythonExtensions = [".py", ".pyc", ".pyd", ".pyo", ".pyw", ".pyz"];
  const rstExtensions = [".rst"];
  const rubyExtensions = [".ruby"];
  const rustExtensions = [".rs"];
  const scalaExtensions = [".scala"];
  const swiftExtensions = [".swift"];
  const markdownExtensions = [".md"];
  const latexExtensions = [".tex"];
  const htmlExtensions = [".html", ".htm"];

  switch (true) {
    case javascriptExtensions.some((extension) => filePath.endsWith(extension)):
      return "js";
    case javaExtensions.some((extension) => filePath.endsWith(extension)):
      return "java";
    case cppExtensions.some((extension) => filePath.endsWith(extension)):
      return "cpp";
    case goExtensions.some((extension) => filePath.endsWith(extension)):
      return "go";
    case phpExtensions.some((extension) => filePath.endsWith(extension)):
      return "php";
    case protoExtensions.some((extension) => filePath.endsWith(extension)):
      return "proto";
    case pythonExtensions.some((extension) => filePath.endsWith(extension)):
      return "python";
    case rstExtensions.some((extension) => filePath.endsWith(extension)):
      return "rst";
    case rubyExtensions.some((extension) => filePath.endsWith(extension)):
      return "ruby";
    case rustExtensions.some((extension) => filePath.endsWith(extension)):
      return "rust";
    case scalaExtensions.some((extension) => filePath.endsWith(extension)):
      return "scala";
    case swiftExtensions.some((extension) => filePath.endsWith(extension)):
      return "swift";
    case markdownExtensions.some((extension) => filePath.endsWith(extension)):
      return "markdown";
    case latexExtensions.some((extension) => filePath.endsWith(extension)):
      return "latex";
    case htmlExtensions.some((extension) => filePath.endsWith(extension)):
      return "html";
    default:
      return "sol";
  }
}
