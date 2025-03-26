const express = require("express");
require('dotenv').config();
const connectDB = require('./db');

// Connect to MongoDB
connectDB();

// Route imports
const primbon = require("./routes/primbon");
const religion = require("./routes/religion");
const downloader = require("./routes/downloader");
const artificial = require("./routes/artificial");
const saweria = require("./routes/saweria");
const { router: auth } = require("./routes/member");
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
app.use("/primbon", primbon);
app.use("/religion", religion);
app.use("/downloader", downloader);
app.use("/artificial", artificial);
app.use("/saweria", saweria);

// Initialize Swagger documentation
swaggerDocs(app);

const PORT = 8080;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
