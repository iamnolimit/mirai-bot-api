const express = require("express");
require('dotenv').config();
const connectDB = require('./db');
const { initCronJobs } = require('./cronjob');

// Connect to MongoDB
connectDB();

// Route imports
const primbon = require("./routes/primbon");
const religion = require("./routes/religion");
const downloader = require("./routes/downloader");
const artificial = require("./routes/artificial");
const payment = require("./routes/payment");
const tools = require("./routes/tools");
const games = require("./routes/games");
const { router: auth } = require("./routes/member");
const admin = require("./routes/admin");
const { swaggerDocs } = require("./swagger");


const app = express();
// noinspection JSCheckFunctionSignatures
app.use(express.json({ extended: false }));

// Root route handler - redirect to API documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// API routes
app.use("/member", auth);
app.use("/admin", admin);
app.use("/primbon", primbon);
app.use("/religion", religion);
app.use("/downloader", downloader);
app.use("/artificial", artificial);
app.use("/payment", payment);
app.use("/tools", tools);
app.use("/games", games);

// Initialize Swagger documentation
swaggerDocs(app);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
  
  // Initialize cron jobs
  initCronJobs();
});
