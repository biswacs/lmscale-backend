require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./src/models");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1/user", userRoutes);
app.get("/v1/lmscale", (req, res) => {
  res.json({ msg: "LmScale" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync({ force: true });
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
