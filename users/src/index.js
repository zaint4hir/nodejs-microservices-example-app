"use strict";

const express = require("express");
// Serve simple frontend UI (NEW - no impact on existing logic)
app.get("/ui", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Microservices Dashboard</title>
  <style>
    body {
      font-family: Arial;
      background: #0f172a;
      color: white;
      text-align: center;
      padding: 40px;
    }
    .card {
      background: #1e293b;
      padding: 20px;
      margin: 20px auto;
      width: 400px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    button {
      padding: 10px 15px;
      margin: 5px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .sunny { background: #facc15; }
    .rain { background: #38bdf8; }
    .snow { background: #e2e8f0; }
    pre {
      background: black;
      padding: 10px;
      text-align: left;
      overflow-x: auto;
    }
  </style>
</head>
<body>

  <h1>🚀 Microservices Dashboard</h1>

  <div class="card">
    <h2>Weather API</h2>

    <button class="sunny" onclick="callWeather('')">Sunny</button>
    <button class="rain" onclick="callWeather('rain')">Rain</button>
    <button class="snow" onclick="callWeather('snow')">Snow</button>

    <pre id="weatherResult">Result will show here...</pre>
  </div>

  <div class="card">
    <h2>Users Service</h2>
    <button onclick="callUsers()">Fetch Data</button>
    <pre id="userResult">Waiting...</pre>
  </div>

<script>
async function callWeather(type) {
  const res = await fetch('/?weather=' + type);
  const text = await res.text();
  document.getElementById('weatherResult').innerText = text;
}

async function callUsers() {
  const res = await fetch('/api/data');
  const text = await res.text();
  document.getElementById('userResult').innerText = text;
}
</script>

</body>
</html>
  `);
});
const mongodb = require("mongodb");

// Constants
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || "0.0.0.0";
const DBHOST = process.env.DBHOST || "mongodb://localhost:27017";

// App
const app = express();

function startServer() {
  return new Promise((resolve, reject) => {
    app.listen(PORT, HOST, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Running on http://${HOST}:${PORT}`);
        resolve();
      }
    });
  });
}

async function main() {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db("mydb");

  app.get("/api/data", (req, res) => {
    const collection = db.collection("mycollection");
    collection
      .find()
      .toArray()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.error("Error retrieving data.");
        console.error((err && err.stack) || err);

        res.sendStatus(500);
      });
  });

  await startServer();
}

main()
  .then(() => console.log("Online"))
  .catch((err) => {
    console.error("Failed to start!");
    console.error((err && err.stack) || err);
  });
