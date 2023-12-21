import { Probot } from "probot";
import main from "./main";

export = (app: Probot) => {
  app.log.info("Yay! glide bot was loaded");

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue! from typescript app",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  main(app);
};
