import { Commit } from "../types/Commit";
import { getTimeDifference } from "../utils";

export function calculateRiskScore(commits: Commit[]): number {
  const bugRegex = new RegExp(
    ".*\\b([Bb]ug(s|gy|ged)?|[Fixf]ix(es|ed|ing)?|[Closec]lose(s|d|ing)?|[ResolveRr]esolve(s|d|ing)?|[AddressAa]ddress(es|ed|ing)?).*"
  );

  commits.sort((a, b) => a.date.getTime() - b.date.getTime());
  const oldestCommit = commits[0];

  let hotSpotFactor = 0;

  commits.forEach((commit: Commit) => {
    if (!commit.message.match(bugRegex)) {
      return;
    }

    const thisCommitDiff = getTimeDifference(commit.date);
    const lastCommitDiff = getTimeDifference(oldestCommit.date);

    let factor = thisCommitDiff / lastCommitDiff;
    factor = 1 - factor;

    hotSpotFactor += 1 / (1 + Math.exp(-12 * factor + 12));
  });

  return hotSpotFactor;
}
