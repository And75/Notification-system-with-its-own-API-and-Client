var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Create a class for the element
class BeamTestClient {
    //authToken: string = '';
    constructor(opt) {
        //Web component parmeters
        this.socket = null;
        this.body = document.body;
        this.cBody = null;
        this.cWrapper = null;
        this.cHeader = null;
        this.store = [];
        this.storeLog = [];
        this.default = {
            //Web Soket parmeters
            wsUrl: 'ws://localhost:8080',
            appName: 'beam-notification-client',
            options: {
                client: {
                    identifier: "beam-client-test",
                    logToken: 'KjTgUhtl3dlqq#ssds_'
                }
            }
        };
        //Clean Unread
        this.store = [];
        //Merge the default options whit incoming opt
        this.conf = Object.assign(this.default, opt);
        console.log(this.conf);
        //Reder de element
        this.render().then((res) => {
            //Opens the comunication whith remote websoket
            this.wsConnections().then((res) => {
                this.log("client-ws", '"Connection to web soket is open"', 'info');
                window.addEventListener('error', (event) => {
                    event.preventDefault;
                    this.log('client-windows', event.message, event.type);
                });
            }).catch((error) => {
                console.error(error);
            });
        }).catch((res) => {
            this.log('render', res, 'error');
        });
    }
    /**
     * @name render
     * @description this method render the wrap of container
     * @returns <Promise>
     */
    render() {
        const promise = new Promise((resolve, reject) => {
            try {
                // Create Wrapper
                this.cWrapper = document.createElement('div');
                this.cWrapper.setAttribute('class', 'wrapper');
                // Create header
                this.cHeader = document.createElement('div');
                this.cHeader.setAttribute('class', 'header');
                this.cHeader.innerHTML = "Beam notifications <small>Click on item to mark as read<small>";
                // Create body
                this.cBody = document.createElement('div');
                this.cBody.setAttribute('class', 'body');
                // Create some CSS to apply to the shadow dom
                const style = document.createElement('style');
                style.textContent = `
                    .wrapper {
                        position: absolute;
                        bottom: 0;
                        right: 0;
                        padding: 0;
                        margin: 15px;
                        width: 300px;
                        z-index: 500;
                        border-radius: 5px;
                        font-family: sans-serif;
                        font-size: 1rem;
                        color: #666464;
                    }
                    .wrapper .header{
                        margin: 10px 0;
                        height: 20px;
                    }
                    .wrapper .header small{
                        font-size: 0.7rem;
                        display: block;
                    }
                    .wrapper .body{
                        padding: 0;
                        margin: 15px 0;
                        list-style: none;
                    }
                    .wrapper .item{
                        width: auto;
                        margin: 19px 0;
                        background: #f4f4f4;
                        border-radius: 3px;
                        padding: 10px 15px;
                        font-size: 0.8rem;
                        line-height: 1.2rem;
                        border-bottom: 8px solid #656464;
                        box-shadow: 2px 2px 5px #929292;
                        cursor:pointer;
                        transition-property: opacity, top, display;
                        transition-duration: 2s, 2s, 3s;
                    }
                    .wrapper .item:active{
                        background:#c9e5bb!important;
                    }
                    .wrapper .item.success{
                        border-bottom-color: #3aa302;
                    }
                    .wrapper .item.info{
                        border-bottom-color: #00cde2;
                    }
                    .wrapper .item.warning{
                        border-bottom-color:#ffcc00;
                    }
                    .wrapper .item.error{
                        border-bottom-color:#ff0000;
                    }
                    .wrapper .item:hover{
                        background : #fff;
                        box-shadow: 2px 2px 15px #929292;
                    }
                    .wrapper .item.disabled{
                        display:none;
                        right: -3rem;
                    }
                `;
                // Attach the created elements to the shadow dom
                this.body.appendChild(style);
                this.body.appendChild(this.cWrapper);
                this.cWrapper.appendChild(this.cHeader);
                this.cWrapper.appendChild(this.cBody);
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        });
        return promise;
    }
    /**
     * @name updatePopNotification
     * @description this method generate and update the notification on pop up format
     */
    updatePopNotification() {
        try {
            while (this.cBody.firstChild) {
                this.cBody.removeChild(this.cBody.firstChild);
            }
            this.store.forEach((data, index) => {
                // Create html item element
                let item = document.createElement('div');
                item.classList.add("item", data.type);
                item.setAttribute("id", 'n-' + index);
                item.innerHTML = `<b>Process: ${data.process}</b><br>${data.message}`;
                item.setAttribute('onclick', 'App.removeNotification(' + index + ')');
                this.cBody.appendChild(item);
            });
        }
        catch (error) {
            this.log("client-updatePopNotification", error, 'error');
        }
    }
    /**
     * @name logNotification
     * @description thi method print the notification on console
     */
    logNotification() {
        //Log the notification on console by type
        this.store.forEach((data, index) => {
            switch (data.type) {
                case 'error':
                    console.error(`Process: ${data.process}`, data.message);
                    break;
                case 'warning':
                    console.warn(`Process: ${data.process}`, data.message);
                    break;
                case 'info':
                    console.info(`%cProcess: ${data.process} ${data.message}`, 'color: white; background-color: #00cde2; padding:3px');
                    break;
                default:
                    let mess = `Sorry, we are out of type of notification : ${data.type}`;
                    this.log('client-logNotification', mess, "warning");
            }
        });
    }
    /**
     * @name retrieveNotification
     * @description this method manage the output of notification
     * @return void
     */
    retrieveNotification(log = true) {
        this.updatePopNotification();
        if (log)
            this.logNotification();
    }
    /**
     * @name storeNotification
     * @description this method store the unread notification
     * @return lenght of store
     */
    storeNotification(data) {
        let length = this.store.push(data);
        return length;
    }
    /**
    * @name removeNotification
    * @description this method remove the read notification
    * @return lenght of store
    */
    removeNotification(index) {
        const mess = this.wsFormatMess('remove-notification', [this.store[index]]);
        this.socket.send(mess);
        const remove = this.store.splice(index, 1);
        this.retrieveNotification(false);
    }
    //This version is for testing
    createNotification(type, process) {
        const data = {
            "warning": {
                process: "render",
                message: 'Warning this process is at max of memory',
                type: 'warning',
                isRead: false,
            },
            "info": {
                process: "windows-sender",
                message: 'This process is on in minimal memory saturation',
                type: 'info',
                isRead: false,
            }
        };
        this.log(data[type].process, data[type].message, type);
    }
    /*this method test an windows error*/
    testError() {
        try {
            const badCode = 'const s;';
            eval(badCode);
        }
        catch (error) {
            throw new Error(error);
        }
    }
    /**
     * @name log
     * @description this method retrive the internal class log end sent notification to WS
     * @param process
     * @param message
     * @param type
     */
    log(process, message, type) {
        const timestp = new Date().getTime();
        process = process + '-' + timestp;
        const notification = {
            process: process,
            message: message,
            type: type
        };
        const mess = this.wsFormatMess('send-notification', [notification]);
        this.socket.send(mess);
    }
    /**
     * @description this method format the message to send at WS
     * @param service
     * @param payload
     * @returns string
     */
    wsFormatMess(service, payload) {
        const mess = {
            application: this.conf.appName,
            service: service,
            payload: payload
        };
        return JSON.stringify(mess);
    }
    /**
     * @name wsMessageHandler
     * @description this method handler the mess from ws and perform the required action
     */
    wsMessageHandler() {
        this.socket.addEventListener('message', (event) => {
            //Transform string on data
            const data = JSON.parse(JSON.parse(event.data));
            //const data = JSON.parse(mess);
            switch (data.service) {
                case 'send-notification':
                    //Display the BeamNotification
                    this.storeNotification(data.payload[0]);
                    this.retrieveNotification();
                    break;
                default:
                    let mess = `Sorry, we are out of type of notification : ${data.type}`;
                    this.log('client-logNotification', mess, "warning");
            }
        });
    }
    /**
     * @name wsConnections
     * @description This method is used for connect to WS
     * @returns <Promise>
     */
    wsConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                this.socket = new WebSocket(this.conf.wsUrl);
                // Connection opened
                this.socket.addEventListener('open', (event) => {
                    const message = 'Connectio to web soket is open';
                    //initialize the message handler
                    this.wsMessageHandler();
                    resolve(message);
                });
                //Connection error
                this.socket.addEventListener('error', (event) => {
                    reject(event);
                });
            });
            return promise;
        });
    }
}
;
const options = {
    client: {
        identifier: "beam-client-test",
        logToken: 'KjTgUhtl3dlqq#ssds_'
    }
};
const App = new BeamTestClient(options);
//# sourceMappingURL=main-client.js.map