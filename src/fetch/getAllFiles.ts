import { Probot } from "probot";
import configs from "../configs/fetch.configs.json";
import { fetchDetailsWithInstallationId } from "./fetch";
import FilePath from "../types/FilePath";

export async function getAllFiles(
  app: Probot,
  installationId: number,
  owner: string,
  repoName: string
): Promise<FilePath[]> {
  try {
    const response: any = await fetchDetailsWithInstallationId(
      app,
      installationId,
      configs.all_files.endpoint,
      {
        owner: owner,
        repo: repoName,
        tree_sha: configs.all_files.default_branch,
        recursive: true,
      }
    );

    const files: any[] = [...response.data.tree];
    const filePaths: FilePath[] = files.map((file: any) => ({
      path: file.path,
    }));

    app.log.info(
      `Total ${filePaths.length} files fetched from repository: ${owner}/${repoName} for installation id: ${installationId}`
    );

    return filePaths;
  } catch (error: any) {
    app.log.error(
      `Error occurred while fetching all files for ${owner}/${repoName} and installation id: ${installationId}`
    );
    app.log.error(error);
    return [];
  }
}
