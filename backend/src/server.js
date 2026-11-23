import { connectDatabase } from "./config/db.js";
import { ENV, assertEnv } from "./config/env.js";

assertEnv();

// app.js is loaded after assertEnv() so a missing setting is reported before anything else starts
const { default: app, setReady } = await import("./app.js");

app.listen(Number(ENV.PORT), () => console.log(`Server listening on port ${ENV.PORT} (${ENV.NODE_ENV}), connecting to the database…`));

connectDatabase()
  .then(() => {
    setReady(true);
    console.log("Server ready");
  })
  .catch((err) => {
    console.error("Could not start:", err);
    process.exit(1);
  });
