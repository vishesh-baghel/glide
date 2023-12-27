import { Commit } from "../types/Commit";
import { getTimeDifference } from "../utils";

export function calculateRiskScore(commits: Commit[]): number {
  commits.sort((a, b) => a.date.getTime() - b.date.getTime());
  const oldestCommit = commits[0];
  let hotSpotFactor = 0;

  commits.forEach((commit: Commit) => {
    const thisCommitDiff = getTimeDifference(commit.date);
    const lastCommitDiff = getTimeDifference(oldestCommit.date);
    let factor = thisCommitDiff / lastCommitDiff;
    factor = 1 - factor;

    hotSpotFactor += 1 / (1 + Math.exp(-12 * factor + 12));
  });

  return hotSpotFactor;
}
