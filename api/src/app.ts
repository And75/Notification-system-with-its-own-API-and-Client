import express from "express";
import path from "path";
import { WebSocketServer } from 'ws';
import { readFile } from 'fs';


// Controllers (route handlers)
import { BeamMessApiController } from "./controllers/api";


//Creating websoket to comunicate whidth the client
//The port of ws is (8080)
const wss = new WebSocketServer({ port: 8080 }, () => {
    console.log('- WebsoketServer is running at : ws://localhost:8080')
});
wss.on('error', (error) => {
    console.log(error);
})
// Using class to controller the WS
wss.on('connection', BeamMessApiController);

// Create express paralel server to simulate API end point to grab the new message.
// Create Express server
const app = express();

//ADD Capability for json post request;
app.use(express.json());

//SET Url for get the complete alert JSON
app.get("/get-notifications", function (req, res) {
    readFile("./../../../data/ext-notifications.json", (err, data) => {
        if (err) throw err;
        let messages: Notification[] = JSON.parse(data.toString());
        res.json(messages)
    });
});

app.set("port", process.env.PORT || 3000);


/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    console.log(
        "- External API for get and register the notification is running at http://localhost:%d in %s mode",
        app.get("port"),
        app.get("env")
    );
    console.log("- Url for get the json is http://localhost:%d/get-notifications", app.get("port"))

    console.log("  Press CTRL-C to stop all\n");
});

export default server;

