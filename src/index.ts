import { Probot } from "probot";
import main from "./main";

export = (app: Probot) => {
  app.log.info("Yay! glide bot was loaded");

  main(app);
};
