const express = require('express');
const http = require('http'); // Needed for server creation
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const port = 1337;

// Parse cookies
app.use(cookieParser());
// Create HTTP server from Express app
const server = http.createServer(app);

// Parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const indexRouter = require('./routes/routes');
app.use('/', indexRouter);

// Start server
server.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
