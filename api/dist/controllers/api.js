"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeamMessApiController = void 0;
const http_1 = __importDefault(require("http"));
const rxjs_1 = require("rxjs");
const node_json_db_1 = require("node-json-db");
const JsonDBConfig_1 = require("node-json-db/dist/lib/JsonDBConfig");
class BeamMessServices {
    constructor(ws, req) {
        this.externalApi = "http://localhost:3000/get-notifications";
        this.application = 'beam-notification';
        //authToken: string = "APP-4590GTjkRTz";
        //logToken: string = "KjTgUhtl3dlqq#ssds_";
        this.db = null;
        this.store = [];
        this.ws = ws;
        this.req = req;
        //this.externalApi = this.externalApi;
        this.db = new node_json_db_1.JsonDB(new JsonDBConfig_1.Config("./../../data/notification", true, false, '/'));
        this.db.reload();
        //Start send stored notification
        this.sendStoredNotification();
        //Start sendin notification from external api
        this.sendNotificationsFromApi();
        //Start request handler for message
        this.ws.on('message', (json) => {
            this.wsRequestHandler(json);
        });
    }
    /**
     * @name getMessagesFromApi
     * @param url the url of external Api to get new notification
     * @returns <Promise>
     */
    getMessagesFromApi(url) {
        // Return a new promise with standard http method to exec a get request
        // Normaly i prefer to use axios
        const get = new Promise(function (resolve, reject) {
            http_1.default.get(url, (res) => {
                let body = "";
                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on("end", () => {
                    try {
                        let json = JSON.parse(body.toString());
                        resolve(json);
                    }
                    catch (error) {
                        reject(error);
                    }
                    ;
                });
            }).on("error", (error) => {
                reject(error.message);
            });
        });
        return get;
    }
    /**
     * @name writeUnReadNotification
     * @description Thi method write the received unread notification from client
     * @param data BeamNotification[]
     * @returns
     */
    storeNotification(data) {
        this.db.push('/' + data[0].process, data[0]);
    }
    removeNotification(data) {
        this.db.delete('/' + data[0].process);
    }
    sendStoredNotification() {
        const stored = this.db.getData("/");
        if (stored) {
            for (const property in stored) {
                this.wsStreamNotification([stored[property]], false);
            }
        }
    }
    /**
     * @name sendNotificationsFromApi
     * @description This function open a Observer to send notification from external api
     *
     * @return <Observer> | Error from http.get
     */
    sendNotificationsFromApi() {
        //GEt Notification from external Api
        this.getMessagesFromApi(this.externalApi).then((res) => {
            //Generate observable by "from" of rxjs
            const dataObj = (0, rxjs_1.from)(res).pipe((0, rxjs_1.filter)(item => item.isRead == false));
            //Delay the stream by create observable "interval" of rxjs
            const timed = (0, rxjs_1.interval)(1500);
            //Combine the observables by "zip" of rxjs
            const zipped = (0, rxjs_1.zip)(dataObj, timed);
            //Subscribe to new observable
            zipped.subscribe({
                next: (x) => {
                    //send the notification by ws
                    this.wsStreamNotification([x[0]]);
                },
                error: (e) => console.error(e),
                complete: () => {
                    console.info('Sending from external API is completed');
                }
            });
        }).catch((res) => {
            console.error(res);
        });
    }
    /**
     * @name wsFormatMessage
     * @description This method formatting de WsMessage for comunication with the clients
     * @param service string
     * @param status boolean
     * @param data BeamNotification | LoginDetail
     * @returns
     */
    wsFormatMessage(service, status, data) {
        const mess = {
            application: "beam-notification-api",
            service: service,
            status: status,
            payload: data,
        };
        return JSON.stringify(mess);
    }
    /**
     * @name wsStreamNotification
     * @description : this function send the message to clients
     * @param data BeamNotification[]
     * @returns void
     */
    wsStreamNotification(data, store = true) {
        if (store) {
            this.storeNotification(data);
        }
        const stream = this.wsFormatMessage('send-notification', true, data);
        this.ws.send(JSON.stringify(stream));
    }
    /**
     * @name wsRequestHandler
     * @description This has the role of handler of incoming messages and launch the requested action
     * @param request
     *
     * @returns void
     */
    wsRequestHandler(request) {
        const mess = JSON.parse(request);
        switch (mess.service) {
            case 'send-notification':
                this.wsStreamNotification(mess.payload);
                break;
            case 'remove-notification':
                this.removeNotification(mess.payload);
                break;
            default:
                console.log(`Sorry, we are out of ${mess.service}.`);
        }
    }
}
/**
 * @route GET /api
 */
const BeamMessApiController = (ws, req) => {
    new BeamMessServices(ws, req);
};
exports.BeamMessApiController = BeamMessApiController;
//# sourceMappingURL=api.js.map