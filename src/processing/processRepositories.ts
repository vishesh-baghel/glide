import { Probot } from "probot";
import { FileType } from "../types/File";
import { Commit } from "../types/Commit";
import { getAllCommits } from "../fetch/getAllCommits";
import { getAllFiles } from "../fetch/getAllFiles";
import { calculateRiskScore } from "./calculateRiskScore";
import { FilePath } from "../types/FilePath";
import { File } from "../db/models/File";

export async function processRepositories(app: Probot, response: any) {
  const { repositories, installation } = response;
  const repos: any[] = repositories;
  const installationId: number = installation.id;

  // Confirmed from https://github.com/orgs/community/discussions/24509
  const owner = installation.account.login;

  app.log.info(`Started the processing of repositories for ${installationId}`);

  await Promise.all(
    repos.map(async (repo) => {
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
          return commits;
        });

        const allCommits = await Promise.all(commitsPromises);

        const riskScorePromises = fileNames.map((file, index) => {
          const score: number = calculateRiskScore(allCommits[index]);

          return {
            installationId: installationId,
            owner: owner,
            repoName: repo.name,
            filePath: file.path,
            commits: allCommits[index],
            riskScore: score,
          };
        });

        const files = await Promise.all(riskScorePromises);

        await Promise.all(
          files.map(async (file: FileType) => {
            await File.create({
              installationId: file.installationId,
              owner: file.owner,
              repoName: file.repoName,
              filePath: file.filePath,
              commits: file.commits,
            });
          })
        );
      } catch (error: any) {
        app.log.error(error);
      }
    })
  );
}
