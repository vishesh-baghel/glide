import { DataObject } from "json2md";

export enum CommentType {
  Error = "error",
}

export function pullRequestOpenComment(rows: string[][]): DataObject[] {
  return [
    { h2: "Pay more attention while reviewing these files" },
    {
      blockquote:
        "This curated list helps you focus on files that may have significant issues. Files are prioritized by their risk scores. A zero 'current risk score' or a zero 'predicted risk score' may indicate a new file or insufficient historical data. Your attention to these files is greatly appreciated!",
    },
    {
      table: {
        headers: ["File Path", "Current Risk Score", "Predicted Risk Score"],
        rows: rows,
      },
    },
  ];
}

export function errorFallbackCommentForPROpenEvent(): string {
  return "We are facing some trouble at our end. Don't worry, we will show you the risk scores next time you open a pull request for sure.";
}

export function errorFallbackCommentForPRClosedEvent(): string {
  return "An error occurred while updating the files modified in this closed pull request. Don't worry, we have the backup for all the files in this pull request. The risk scores will be updated soon";
}
