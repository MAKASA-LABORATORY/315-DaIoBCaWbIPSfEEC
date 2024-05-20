const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const session = require("express-session");
const path = require('path');
const { PythonShell } = require("python-shell");

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
    origin: true,
    credentials: true,
}
const timezone = 'Asia/Manila';
process.env.TZ = timezone;

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({ secret: process.env.PUBLICVAPIDKEY, resave: false, saveUninitialized: false }))

const Auth = require("./routes/auth.routes");
const Api = require("./routes/api.routes");
const Template = require('./routes/template.routes');
const AdminsRoute = require('./routes/admins.routes');

// File Upload API
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(express.static('public'));
// Email Sender

app.use("/api", Api);
app.use("/auth", Auth);
app.use("/template", Template);
app.use("/admins", AdminsRoute);

app.get('/', function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Welcome developer! Build Date: 01232023');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

// Endpoint to run OMR_main.py
app.get("/run_omr", (req, res) => {
  const pythonProcess = spawn("python", [path.join(__dirname, "python", "OMR_main.py")]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`OMR_main.py stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`OMR_main.py stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`OMR_main.py process exited with code ${code}`);
    // You can send any data as a response if needed
    res.send(`OMR_main.py process exited with code ${code}`);
  });
});
