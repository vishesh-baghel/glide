import { Commit } from "./Commit";

export type FileType = {
  installationId: number;
  owner: string;
  repoName: string;
  filePath: string;
  commits: Commit[];
  riskScore: number;
  predictedRiskScore: number;
};
