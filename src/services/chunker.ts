import { client } from "@gradio/client";

export async function chunker() {
  const app = await client("https://vishesh-baghel-chunker.hf.space/", {});
  const result: any = await app.predict(0, [
    "Python: Sweep's GiHub Actions log handler", // string (Option from: ["Python: Sweep's GiHub Actions log handler", "Typescript: LlamaIndex TS's BaseIndex abstract base class", "Rust: Ruff's autofix code modification algorithm", "Go: Infisical's CLI's config manager"]) in 'Examples' Dropdown component
  ]);

  console.log(result.data);
}
