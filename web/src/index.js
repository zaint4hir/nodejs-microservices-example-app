"use strict";

const express = require("express");

const axios = require("axios");

// Constants
const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || "0.0.0.0";
const USERS_SERVICE_URL = process.env.SERVICE_URL || "http://users-service";

// App
const app = express();
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
async function checkWeather(weather, res) {
  switch (weather) {
    // it's raining, we are loosing time
    case "rain":
      await sleep(1500);
      res.status(202).send("Hello Rainy World!\n");
      break;

    // it's snowing, generate error
    case "snow":
      res.status(500).send("Bye Bye Snow!\n");
      console.log(`ERROR: IT IS SNOWING`);
      break;

    // by default, it's sunny
    default:
      res.status(200).send("Hello Sunny World!\n");
  }
}

async function generateWork(nb) {
  for (let i = 0; i < Number(nb); i++) {
    console.log(`*** DOING SOMETHING ${i}`);
    // wait for 50ms to simulate doing some work
    await sleep(50);
  }
}

async function main() {
  app.get("/", (req, res) => {
    let nbLoop = req.query.loop;
    let weather = req.query.weather;
    // generate some work
    if (nbLoop != undefined) {
      generateWork(nbLoop);
    }
    // Set the response based on the weather input
    if (weather == undefined) {
      res.send("Hello World!\n");
    } else {
      checkWeather(weather, res);
    }
  });

  app.get("/api/data", (req, res) => {
    axios
      .get(USERS_SERVICE_URL + "/api/data")
      .then((response) => {
        res.json(response.data);
      })
      .catch((err) => {
        console.error("Error forwarding request:");
        console.error((err && err.stack) || err);
        res.sendStatus(500);
      });
  });

  await startServer();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    app.listen(PORT, HOST, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

main()
  .then(() => console.log("Online"))
  .catch((err) => {
    console.error("Failed to start!");
    console.error((err && err.stack) || err);
  });
