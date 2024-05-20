import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import router from "./apis/api.js";
import mongoose from "mongoose";
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error(err));
app.use(router);
app.get("/", (req, res) => {
  res.send("Server of Bistro Boss");
});
app.listen(port, () => {
  console.log(`App is listening at ${port}`);
});
