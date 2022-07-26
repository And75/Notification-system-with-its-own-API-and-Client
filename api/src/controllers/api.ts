"use strict";
import http from "http";

import { Request } from "express";
import { WebSocket } from "ws";
import { from, interval, zip, filter } from 'rxjs';
import { BeamNotification } from "./../types/api-types";
import { WsMessage } from "./../types/api-types";
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'

class BeamMessServices {

    ws: WebSocket;
    req: Request;
    externalApi :string = "http://localhost:3000/get-notifications"
    application: string = 'beam-notification';
    //authToken: string = "APP-4590GTjkRTz";
    //logToken: string = "KjTgUhtl3dlqq#ssds_";
    db:JsonDB = null;
    store: BeamNotification[] = [];

    constructor(ws: WebSocket, req: Request) {

        this.ws = ws;
        this.req = req;
        //this.externalApi = this.externalApi;

        this.db = new JsonDB(new Config("./../../data/notification", true, false, '/'));
        this.db.reload();
       
        //Start send stored notification
        this.sendStoredNotification()

        //Start sendin notification from external api
        this.sendNotificationsFromApi();

        //Start request handler for message
        this.ws.on('message', (json: string) => {
            this.wsRequestHandler(json);
        });

    }

    /**
     * @name getMessagesFromApi
     * @param url the url of external Api to get new notification
     * @returns <Promise>
     */
    getMessagesFromApi(url:string) {
        // Return a new promise with standard http method to exec a get request
        // Normaly i prefer to use axios
        const get = new Promise(function (resolve, reject) {
            http.get(url, (res: any) => {

                let body = "";

                res.on("data", (chunk: any) => {
                    body += chunk;
                });

                res.on("end", () => {
                    try {
                        let json = JSON.parse(body.toString());
                        resolve(json)
                    } catch (error) {
                        reject(error)
                    };
                });

            }).on("error", (error: any) => {
                reject(error.message)
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
    storeNotification(data: BeamNotification[]) {
        this.db.push('/'+data[0].process, data[0]);
    }

    removeNotification(data:BeamNotification[]){
        this.db.delete('/'+data[0].process);
    }

    sendStoredNotification(){
        const stored = this.db.getData("/");
        if(stored){
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
        this.getMessagesFromApi(this.externalApi).then((res: [any]) => {
            //Generate observable by "from" of rxjs
            const dataObj = from(res).pipe(filter(item => item.isRead == false));
            //Delay the stream by create observable "interval" of rxjs
            const timed = interval(1500);
            //Combine the observables by "zip" of rxjs
            const zipped = zip(dataObj, timed)
            //Subscribe to new observable
            zipped.subscribe({
                next: (x) => {
                    //send the notification by ws
                    this.wsStreamNotification([x[0]])
                },
                error: (e) => console.error(e),
                complete: () => {
                    console.info('Sending from external API is completed')
                }
            });
        }).catch((res) => {
            console.error(res)
        })
    }

    /**
     * @name wsFormatMessage
     * @description This method formatting de WsMessage for comunication with the clients
     * @param service string 
     * @param status boolean
     * @param data BeamNotification | LoginDetail
     * @returns 
     */
    wsFormatMessage(service: string, status: boolean, data:any): string {
        const mess = {
            application: "beam-notification-api",
            service: service,
            status: status,
            payload: data,
        }
        return JSON.stringify(mess);
    }

    /**
     * @name wsStreamNotification
     * @description : this function send the message to clients 
     * @param data BeamNotification[]
     * @returns void
     */
    wsStreamNotification(data: BeamNotification[], store:boolean=true): void {
        if(store) {this.storeNotification(data);}
        const stream = this.wsFormatMessage('send-notification', true, data)
        this.ws.send(JSON.stringify(stream))
    }

    /**
     * @name wsRequestHandler
     * @description This has the role of handler of incoming messages and launch the requested action
     * @param request
     * 
     * @returns void
     */
    wsRequestHandler(request: string) {
        const mess: WsMessage = JSON.parse(request);
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
export const BeamMessApiController = (ws: WebSocket, req: Request) => {
    new BeamMessServices(ws, req);
};


