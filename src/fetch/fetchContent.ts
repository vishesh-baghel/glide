import { getProbotInstance } from "../auth";
import { fetchDetails } from "./fetch";
import configs from "../configs/fetch.configs.json";

const app = getProbotInstance();

export async function getAllContent(
  owner: string,
  repoName: string,
  path: string
) {
  try {
    const response: any = await fetchDetails(
      app,
      configs.all_files.endpoint_file_content,
      {
        owner: owner,
        repo: repoName,
        path: path,
        headers: {
          accept: "application/vnd.github.v3.raw",
        },
      }
    );
    const data: string = response.data;
    return data;
  } catch (error: any) {
    app.log.error(`Error while getting all files content from github`);
    app.log.error(error);
    throw error;
  }
}
