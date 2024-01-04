import { JobStatus } from "../db/models/Job";

export type Job = {
  jobName: string;
  parameters: Record<string, any>;
  status: JobStatus;
  scheduledAt: Date;
  completedAt?: Date;
};
