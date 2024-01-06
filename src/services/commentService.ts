import { Probot } from "probot";
import { FileScoreMap } from "../types/FileScoreMap";
import json2md from "json2md";
import {
  errorFallbackCommentForPROpenEvent,
  pullRequestOpenComment,
} from "../constants/Comments";

export async function createCommentOnGithub(
  app: Probot,
  comment: string,
  context: any
) {
  const issueComment = context.issue({
    body: comment,
  });
  await context.octokit.issues.createComment(issueComment);
  app.log.info("Added comment on github");
}

export async function constructComment(
  app: Probot,
  files: FileScoreMap[]
): Promise<string> {
  const rows: string[][] = files.map((file: FileScoreMap) => {
    let predictedScore: number | string = file.predictedScore;
    if (typeof predictedScore === "string") {
      predictedScore = parseFloat(predictedScore);
    }
    return [
      `${file.fileName}`,
      `${file.score.toFixed(2)}`,
      `${predictedScore.toFixed(2)}`, // todo: test it to check if it's working correctly after changing the type of predicted score
    ];
  });

  if (rows.length === 0 || rows === undefined || rows === null) {
    app.log.error("File rows are invalid. cannot construct comment");
    return errorFallbackCommentForPROpenEvent();
  }

  const markdown = json2md(pullRequestOpenComment(rows));
  return markdown;
}
