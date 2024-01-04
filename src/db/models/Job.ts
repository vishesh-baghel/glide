import { Document, Schema, model } from "mongoose";

export enum JobStatus {
  Complete = "complete",
  Incomplete = "incomplete",
}

interface Job {
  jobName: string;
  parameters: Record<string, any>;
  status: JobStatus.Complete | JobStatus.Incomplete;
  scheduledAt: Date;
  completedAt?: Date;
}

const jobSchema = new Schema<Job & Document>({
  jobName: { type: String, required: true },
  parameters: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: JobStatus, required: true },
  scheduledAt: { type: Date, required: true },
  completedAt: { type: Date, required: false },
});

export const JobModel = model<Job & Document>("job", jobSchema);
