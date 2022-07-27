export interface BsysNotification {
    process: string;
    message: string;
    type: string;
}
export interface WsMessage {
    application: string;
    service:string;
    status:boolean;
    payload: [];
}
export interface BeamStoreRemove{
    application: string;
    service:string;
    status:boolean;
    payload: string;
}
export interface LoginDetail {
    client :string;
    authtoken : "string";
}