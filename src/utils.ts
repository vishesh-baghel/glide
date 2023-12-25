export function getTimeDifference(date: Date) {
  const currentTime = new Date();
  const difference: number = currentTime.getTime() - date.getTime();
  return difference;
}
export function getTimeStampOlderThanMonths(monthsToReduce: number): string {
  let currentTime = new Date();
  currentTime.setMonth(currentTime.getMonth() - monthsToReduce);
  return currentTime.toISOString();
}
