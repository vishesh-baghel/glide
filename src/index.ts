import { Probot } from "probot";
import { main } from "./main";

export default function app(app: Probot) {
  app.log.info("Yay! glide bot was loaded");
  main(app);
}
