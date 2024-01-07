import { FileStatus } from "../constants/GithubContants";

export type GithubResponseFile = {
  sha: string;
  filePath: string;
  status: FileStatus;
  previousFileName?: string;
};
