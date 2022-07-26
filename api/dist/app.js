"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const fs_1 = require("fs");
// Controllers (route handlers)
const api_1 = require("./controllers/api");
//Creating websoket to comunicate whidth the client
//The port of ws is (8080)
const wss = new ws_1.WebSocketServer({ port: 8080 }, () => {
    console.log('- WebsoketServer is running at : ws://localhost:8080');
});
wss.on('error', (error) => {
    console.log(error);
});
// Using class to controller the WS
wss.on('connection', api_1.BeamMessApiController);
// Create express paralel server to simulate API end point to grab the new message.
// Create Express server
const app = (0, express_1.default)();
//ADD Capability for json post request;
app.use(express_1.default.json());
//SET Url for get the complete alert JSON
app.get("/get-notifications", function (req, res) {
    (0, fs_1.readFile)("./../../data/ext-notifications.json", (err, data) => {
        if (err)
            throw err;
        let messages = JSON.parse(data.toString());
        res.json(messages);
    });
});
app.set("port", process.env.PORT || 3000);
/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    console.log("- External API for get and register the notification is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
    console.log("- Url for get the json is http://localhost:%d/get-notifications", app.get("port"));
    console.log("  Press CTRL-C to stop all\n");
});
exports.default = server;
//# sourceMappingURL=app.js.map