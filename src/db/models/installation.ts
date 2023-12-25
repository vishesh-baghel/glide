import { Schema, model } from "mongoose";

const installationSchema = new Schema({
  installationId: { type: Number, required: true },
  accountLogin: { type: String, required: true },
  repositories: [],
  permissions: { type: Object, required: false },
  events: { type: [String], required: false },
});

const installation = model("installation", installationSchema);

export default { installation, installationSchema };
