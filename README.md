# Notification system with its own API and Client

Type script project for notification system with its own API and a sample client
This project are developped on pure Vanilla Js and Node/Express with very minimal use of external libraries.

## Structure of the project

The project is divided into two folders

1. api (for the node server)
2. client (for "simple" generation of client code )

## Libraries required for the project 

Libraries are present only on Api section of project and is very minimal

### API

```
 "devDependencies": {
    "@types/errorhandler": "^1.5.0",
    "@types/express": "^4.17.13",
    "@types/node": "^17.0.23",
    "@types/ws": "^8.5.3",
    "concurrently": "^7.1.0",
    "jest": "^27.5.1",
    "nodemon": "^2.0.15",
    "typescript": "^4.6.3"
  },
  "dependencies": {
    "express": "^4.17.3",
    "node-json-db": "^1.5.0",
    "rxjs": "^7.5.5",
    "ws": "^8.5.0"
  }
```

### Client 

```
  "devDependencies": {
    "@types/errorhandler": "^1.5.0",
    "@types/express": "^4.17.13",
    "@types/node": "^17.0.23",
    "@types/ws": "^8.5.3",
    "concurrently": "^7.1.0",
    "jest": "^27.5.1",
    "typescript": "^4.6.3"
  },
  "dependencies": {}
```

## How the project works

### The API implement
1. WebSoket to handler and send messages to client on port 8080
2. External APi simulation to port 3000

Api works only on Node server

### The client implement

1. The Class "BsysNotificationClient" intialized on end of loading page 

The Client works on any standard html page as loaded script (defer)

**The schema**

external Api <-> [WebSoket] <-> Client

## Format of message used for websocket communication:

```
{
    application: string; //define the application
    service: string; // define the type of service to handler
    status: boolean; // define the status
    payload: BeamNotification[]; // the array of sended notification
}
```
## Format of notification data

```
{
    process: string; // used to create an unique id on db (virtualy is the node process UID with associate timestamp);
    message: string; // the message 
    type: string; // the type
}
```



## Capability

### The Api
- Sending a notification: **The api send all the notification getted also by external Api request**
- Listing all unread notifications: **only the unread notification are sended, because only the unread notification are conserved**
- Mark a notification as read: **When the user mark a notification as read by WS the Api delete the unread from the store**

### The Client
- Provide a way to generate new notifications: the client uses the API as a notification system
instead of "console" 
1. info notifications are used to communicate unimportant feedback to the user
1. warning notifications are triggered when unusual but not critical conditions occur during  some processing. In such a case the notification must be sent but must not interrupt the  process
1. error notifications are triggered when errors : it is not possible to use "Process" of Node, instead, for this test version, I have put an event listner on windows errors


- Retrieve unread notifications and design your code so that it could theoretically be handled 
them through *any* (including multiple) conforming communication channels: 
1. Display on console 
1. Display in web popup
1. Feed to a remote API (such as Sentry) : **not finalized, but the code allows you to easily insert this function**

- Allow the user to mark a notification as read : **the user mark the notification as read on click on popup**


## How to use this project

Clone the repository

Go to the project folders

Go to the client and api folder

Execute commands:

```
npm i
npm start
```

For test the Client it's possible to use a "Lite Server" on VSCode or similar and open the "index.html"


## Importants notes!

During the testing phase it is important that the data folder is not inserted in the same folder of project.
it is necessary to move it outside

The correct structure folder is:
```
- data
- Notification-system
-- api
-- client
```

Being a test project, the notifications coming from the external API will be repeated at each relaunch of the communication, this is not an error, even if repeated if the user marks them as read, these will not be stored in the store.