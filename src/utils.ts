import { Probot } from "probot";

const APP_ID = process.env.APP_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export function getNewProbotInstance() {
  return new Probot({
    appId: APP_ID,
    privateKey: PRIVATE_KEY,
    secret: WEBHOOK_SECRET,
  });
}

const app = getNewProbotInstance();

export function getTimeDifference(date: Date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    app.log.warn("Commit date not specified");
    return 1;
  }

  const currentTime = new Date();
  const difference: number = currentTime.getTime() - date.getTime();
  return difference;
}

export function getTimeStampOlderThanMonths(monthsToReduce: number): string {
  let currentTime = new Date();
  currentTime.setMonth(currentTime.getMonth() - monthsToReduce);
  return currentTime.toISOString();
}
