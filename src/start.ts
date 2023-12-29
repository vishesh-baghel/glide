// import { Probot, Server } from "probot";
// import app from "./index";
// import { argv } from "process";
// import { smee } from "../proxy";

// async function startServer() {
//   // const server: Server = await run(argv);

//   const server: Server = new Server({
//     Probot: Probot.defaults({
//       appId: APP_ID,
//       privateKey: PRIVATE_KEY,
//       secret: WEBHOOK_SECRET,
//     }),
//     webhookPath: "/github-events",
//   });
//   await server.load(app);

//   server.start();
// }

// startServer();
