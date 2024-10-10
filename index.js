const http = require("http");
const fs = require("fs");
const requests = require("requests");

// Read the HTML file to be served
const homeFile = fs.readFileSync("home.html", "utf-8");

// Function to replace placeholders in HTML with real data
const replaceVal = (tempVal, orgVal) => {
  let temp = tempVal.replace("{%tempval%}", (orgVal.main.temp - 273.15).toFixed(2)); // Convert Kelvin to Celsius
  temp = temp.replace("{%tempmin%}", (orgVal.main.temp_min - 273.15).toFixed(2));
  temp = temp.replace("{%tempmax%}", (orgVal.main.temp_max - 273.15).toFixed(2));
  temp = temp.replace("{%location%}", orgVal.name);
  temp = temp.replace("{%country%}", orgVal.sys.country);
  console.log("Transformed Template: ", temp); // Check if placeholders are being replaced
  return temp;
};

// Create a server to handle client requests
const server = http.createServer((req, res) => {
  if (req.url == "/") {
    // Fetch weather data from the OpenWeatherMap API
    requests(
      "https://api.openweathermap.org/data/2.5/weather?lat=21.2514&lon=81.6296&appid=fc785f62d4a22f1d7123da691f1f54f0"
    )
      .on("data", (chunk) => {
        console.log("Received API data: ", chunk); // Check the raw data received
        const conv = JSON.parse(chunk);
        const arrdata = [conv];

        // Replace placeholders with actual data
        const realTimedata = arrdata
          .map((val) => {
            return replaceVal(homeFile, val);
          })
          .join("");

        console.log("Real-time Data: ", realTimedata); // Log the final output

        // Send the modified HTML as the response
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(realTimedata);
        res.end();
      })
      .on("error", (err) => {
        console.error("Error while making API request: ", err);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>500 Internal Server Error</h1>");
      })
      .on("end", (err) => {
        if (err) {
          console.log("Connection closed due to errors", err);
          res.end();
        } else {
          console.log("API request completed successfully");
        }
      });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

// Start the server on port 5050
server.listen(5050, "127.0.0.1", () => {
  console.log(`Server is running on port: ${server.address().port}`);
});
