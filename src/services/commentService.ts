import { FileScoreMap } from "../types/FileScoreMap";

export async function createCommentOnGithub(comment: string, context: any) {
  const issueComment = context.issue({
    body: comment,
  });
  await context.octokit.issues.createComment(issueComment);
}

export function constructComment(files: FileScoreMap[]): string {
  return "";
}
