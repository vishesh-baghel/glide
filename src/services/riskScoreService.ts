import { Commit } from "../types/Commit";
import { getTimeDifference } from "../utils";
import { Probot } from "probot";

export function calculateRiskScore(app: Probot, commits: Commit[]): number {
  try {
    if (commits.length === 0) {
      return 0;
    }

    commits.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return dateA.getTime() - dateB.getTime();
    });

    const oldestCommit = commits[0];
    let hotSpotFactor = 0;

    commits.forEach((commit: Commit) => {
      const commitDate = new Date(commit.date);
      if (commitDate instanceof Date && !isNaN(commitDate.getTime())) {
        const thisCommitDiff = getTimeDifference(commitDate);
        const lastCommitDiff = getTimeDifference(new Date(oldestCommit.date));
        let factor = thisCommitDiff / lastCommitDiff;
        factor = 1 - factor;

        hotSpotFactor += 1 / (1 + Math.exp(-12 * factor + 12));
      } else {
        app.log.warn(`Invalid commit date ${JSON.stringify(commit)}`);
      }
    });

    return hotSpotFactor;
  } catch (error: any) {
    app.log.error(error);
    return 0;
  }
}
