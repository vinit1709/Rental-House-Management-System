import http from "http";
import app from "./app.js";
import connectDB from "./database/db.js";

const server = http.createServer(app);

const port = process.env.PORT || 3008;

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`🤖 AI Service is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("server is not working: ", error);
  });
