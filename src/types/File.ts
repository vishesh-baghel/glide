import Commit from "./Commit";

type FileType = {
  installationId: number;
  owner: string;
  repoName: string;
  filePath: string;
  commits: Commit[];
};

export default FileType;
