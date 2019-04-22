////////////////////////////////////////////////////////////////////////////////
//                            Space  Ship Battles                             //
////////////////////////////////////////////////////////////////////////////////

import * as express from "express";
import * as http from "http";

let app = express();
let serv = new http.Server(app);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen({
  host: '0.0.0.0',
  port: 2000,
  exclusive: true
});

console.log("Server started succesfully");