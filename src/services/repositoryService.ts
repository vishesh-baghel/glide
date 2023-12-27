import { Probot } from "probot";
import { Commit } from "../types/Commit";
import { getAllCommits } from "../fetch/getAllCommits";
import { getAllFiles } from "../fetch/getAllFiles";
import { calculateRiskScore } from "./riskScoreService";
import { FilePath } from "../types/FilePath";
import { File } from "../db/models/File";
import configs from "../configs/fetch.configs.json";

export async function processRepositories(
  app: Probot,
  response: any
): Promise<void> {
  const batchSize = configs.batch_size.repository_processing_batch_size;

  const { repositories, installation } = response;
  const repos: any[] = repositories;
  const installationId: number = installation.id;
  const owner = installation.account.login;

  app.log.info(`Started the processing of repositories for ${installationId}`);

  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    await processRepositoryBatch(app, installationId, owner, batch);
  }
}

async function processRepositoryBatch(
  app: Probot,
  installationId: number,
  owner: string,
  repositories: any[]
): Promise<void> {
  await Promise.all(
    repositories.map(async (repo) => {
      try {
        app.log.info(`Started processing repository: ${repo.name}`);

        const fileNames: FilePath[] = await getAllFiles(
          app,
          installationId,
          owner,
          repo.name
        );

        app.log.info(
          `Received Total ${fileNames.length} files for processing from repository: ${owner}/${repo.name} with installation id: ${installationId}`
        );

        const commitsPromises = fileNames.map(async (file) => {
          const commits: Commit[] = await getAllCommits(
            app,
            installationId,
            owner,
            repo.name,
            file.path
          );
          return { file, commits };
        });

        const allCommits = await Promise.all(commitsPromises);

        const files = allCommits.map(({ file, commits }) => ({
          installationId: installationId,
          owner: owner,
          repoName: repo.name,
          filePath: file.path,
          commits: commits,
          riskScore: calculateRiskScore(commits),
        }));

        await Promise.all([File.insertMany(files)]);
      } catch (error: any) {
        app.log.error(error);
      }
    })
  );
}
