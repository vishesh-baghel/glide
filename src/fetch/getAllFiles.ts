import { Probot } from "probot";
import configs from "../configs/fetch.configs.json";
import { fetchDetailsWithInstallationId } from "../fetch/fetchBase";
import { FilePath } from "../types/FilePath";
import { GithubResponseFile } from "../types/GithubResponseFile";

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
      configs.all_files.endpoint_git_tree,
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

export async function getAllFilesFromPullRequest(
  app: Probot,
  owner: string,
  repoName: string,
  installationId: number,
  pullNumber: number
) {
  try {
    const response: any = await fetchDetailsWithInstallationId(
      app,
      installationId,
      configs.all_files.endpoint_pull_request,
      {
        owner: owner,
        repo: repoName,
        pull_number: pullNumber,
      }
    );

    const data: any[] = response.data;
    const files: GithubResponseFile[] = data.map((file: any) => ({
      sha: file.sha,
      filePath: file.filename,
      status: file.status,
    }));

    app.log.info(
      `Total ${files.length} files fetched from github for pull request(number:${pullNumber}) of the repository: ${owner}/${repoName}`
    );

    return files;
  } catch (error: any) {
    app.log.error(
      `Error occurred while fetching all files for repository: ${owner}/${repoName} and pull request number: ${pullNumber}`
    );
    app.log.error(error);
    return [];
  }
}
