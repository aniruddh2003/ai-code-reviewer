const { validateEnv } = require("../config");

validateEnv();

const express = require("express");
const routes = require("./routes");
const { getMetrics } = require("../metrics");

const app = express();
app.use(express.json());

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(await getMetrics());
});

app.use("/", routes);

app.listen(3000, () => {
  console.log("API running on port 3000");
  console.log("Metrics available at http://localhost:3000/metrics");
});
