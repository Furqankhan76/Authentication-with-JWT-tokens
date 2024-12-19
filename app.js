import express from "express";
import cookierParser from "cookie-parser";
import cors from "cors";
// import nodeFetch from "node-fetch";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middleware

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookierParser());


import healthcheckroute from "./routes/healthcheck_route.js";
app.use("/healthcheck", healthcheckroute);

import userroute from "./routes/user_routes.js"
import { ApiError } from "./middlewares/Apierror.js";

app.use("/user", userroute)
// app.use(ApiError)

export { app };