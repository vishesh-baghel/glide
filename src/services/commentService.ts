import { Probot } from "probot";
import { FileScoreMap } from "../types/FileScoreMap";
import json2md from "json2md";

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
    const score =
      file.score !== undefined && file.score !== null
        ? file.score.toString()
        : "0";
    return [file.fileName, score];
  });

  app.log.info(rows);

  if (rows.length === 0 || rows === undefined || rows === null) {
    app.log.error("File rows are invalid. cannot construct comment");
    return "We are facing some trouble. The bot will not be able to show the bug prone files";
  }

  const md = json2md([
    { h2: "Pay more attention while reviewing these files" },
    {
      blockquote:
        "This curated list helps you focus on files that may have significant issues. Files are prioritized by their risk scores. A risk score of zero may indicate a new file or insufficient historical data. Your attention to these files is greatly appreciated!",
    },
    {
      table: { headers: ["File Path", "Risk Score"], rows: rows },
    },
  ]);
  return md;
}
