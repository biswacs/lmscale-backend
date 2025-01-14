require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./src/models");
const userRoutes = require("./src/routes/user/user.routes");
const gpuRoutes = require("./src/routes/gpu/gpu.routes");
const assistantRoutes = require("./src/routes/assistant/assistant.routes");
const functionRoutes = require("./src/routes/function/function.routes");
const instructionRoutes = require("./src/routes/instruction/instruction.routes");

const app = express();
const PORT = process.env.PORT || 8000;

app.set("trust proxy", true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Env = process.env.Env || "Prod";
console.log("Environment:", Env);
if (Env == "Local") {
  app.use("/v1/gpu", gpuRoutes);
}

app.use("/v1/user", userRoutes);
app.use("/v1/assistant", assistantRoutes);
app.use("/v1/function", functionRoutes);
app.use("/v1/instruction", instructionRoutes);

app.get("/v1/lmscale", (req, res) => {
  res.json({ message: "LmScale" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync({ alter: false });
    console.log("Database synchronized.");

    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
