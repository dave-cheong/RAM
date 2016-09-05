export enum RAMMessageType {
    Error = 1,
    Info = 2,
    Success = 3
}

export interface Alert {
    messages: string[];
    alertType: RAMMessageType;
}

export interface IResponse<T> {
    data?: T;
    token?: string;
    alert?: Alert;
}

export class ErrorResponse implements IResponse<void> {

    alert: Alert;

    constructor(messages: string | string[],
                alertType: number = RAMMessageType.Error) {
        if (Array.isArray(messages)) {
            this.alert = {messages: messages, alertType: alertType} as Alert;
        } else {
            this.alert = {messages: [messages], alertType: alertType} as Alert;
        }
    }

}