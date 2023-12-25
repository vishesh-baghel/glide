import { Probot } from "probot";

export function createCommentOnGithub(
  app: Probot,
  comment: string,
  event: string | any[]
): void {
  app.on(event, async (context) => {
    const issueComment = context.issue({
      body: comment,
    });
    await context.octokit.issues.createComment(issueComment);
  });
}
