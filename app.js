const express = require("express");
const path = require("path");
// const favicon = require("serve-favicon");
const compression = require("compression");
// const PORT = process.env.VUE_APP_PORT || 3001
const PORT = 3002;
const app = express();
require("dotenv").config();

// compress all responses
app.use(compression());

const DIST_DIR = path.join(__dirname, "./dist");

// app.use(favicon(path.join(DIST_DIR, "favicon.ico")));
app.use(
  express.static(DIST_DIR, {
    maxAge: "3d",
    index: false
  })
);

app.get("*", (req, res) => {
  console.log("Get ", req.originalUrl);

  // Disable browser caching
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.sendFile(path.resolve(DIST_DIR, "./index.html"), { etag: false });
});

app.listen(PORT, () => {
  console.log("app listen on port ", PORT);
});
