import express from "express";
import cors from "cors";
import booksRoutes from "./books/index.js";

const server = express();
server.use(express.json());
const port = process.env.PORT || 3001;

const whiteList = [process.env.FE_URL_DEV, process.env.FE_URL_PROD]; // need to configure it manually on Heroku

// console.log({ whiteList });

const corsOptions = {
  origin: function (origin, next) {
    console.log("ORIGIN", origin);
    if (whiteList.indexOf(origin) !== -1) {
      next(null, true);
    } else {
      next(new Error("Origin not allowed by CORS"));
    }
  },
};

server.use(cors(corsOptions));

server.use("/books", booksRoutes);

server.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log("Server is running on cloud on port:", port);
  } else {
    console.log("Server is running locally on port:", port);
  }
});
