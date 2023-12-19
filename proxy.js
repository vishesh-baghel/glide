const SmeeClient = require("smee-client");

const smee = new SmeeClient({
  source: "https://smee.io/8fDdpQIE6kh08Gk",
  target: "http://localhost:8888/.netlify/functions/github",
  logger: console,
});

smee.start();
