import axios from 'axios';

export const enum SenderAction {
    MARK_SEEN = 'mark_seen',
    TYPING_ON = 'typing_on',
    TYPING_OFF = 'typing_off',
}

export type UserProfileField =
    // Granted by default
    | 'id'
    | 'name'
    | 'first_name'
    | 'last_name'
    | 'profile_pic'
    // Needs approval by Facebook
    | 'locale'
    | 'timezone'
    | 'gender';

export type User = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    profilePic: string;
    locale?: string;
    timezone?: number;
    gender?: string;
};
enum ButtonType {
    POSTBACK = 'postback',
    WEB_URL = 'web_url',
}

interface Button {
    type: ButtonType;
    title: string;
    payload?: string;
    url?: string;
}

enum TemplateType {
    BUTTON = 'button',
    GENERIC = 'generic',
    COUPON = 'coupon',
    CUSTOMER_FEEDBACK = 'customer_feedback',
    MEDIA = 'media',
    PRODUCT = 'product',
    RECEIPT = 'receipt',
    CUSTOMER_INFORMATION = 'customer_information',
}

type QuickReplyType = 'text' | 'user_phone_number' | 'user_email';

interface QuickReply {
    content_type: QuickReplyType;
    title?: string;
    payload?: string;
    image_url?: string;
}
interface Template {
    template_type: string;
    text?: string;
    buttons?: Button[];
    elements?: any[];
    payload?: any;
}
type CallToActionType = 'postback' | 'web_url' | 'phone_number' | 'element_share';
export type CallToAction = {
    type:
}
export type PersistentMenu = {
    locale: string;
    composer_input_disabled: boolean;
    call_to_actions: any[];
};

export class MessengerBot {
    private _pageAccessToken: string;
    private _headers: any;
    private _url: string;
    private _apiVersion: string;

    constructor(pageAccessToken: string) {
        this._pageAccessToken = pageAccessToken;
        this._apiVersion = 'v17.0';
        this._url = `https://graph.facebook.com/${this._apiVersion}/`;
    }

    get pageAccessToken(): string {
        return this._pageAccessToken;
    }

    set pageAccessToken(value: string) {
        this._pageAccessToken = value;
        this._headers = {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this._pageAccessToken,
        };
    }

    get apiVersion(): string {
        return this._apiVersion;
    }

    set apiVersion(value: string) {
        this._apiVersion = value;
        this._url = `https://graph.facebook.com/${this._apiVersion}/`;
    }

    get headers(): any {
        return this._headers;
    }

    set headers(value: any) {
        this._headers = value;
    }

    async sendMessage(senderPsid: string, message: string) {
        const response = {
            text: message,
        };
        await this.callSendAPI(senderPsid, response);
    }

    async callSendAPI(senderPsid: string, response: any) {
        await this.sendMarkSeen(senderPsid);
        await this.sendTypingOn(senderPsid);
        const requestBody = {
            recipient: {
                id: senderPsid,
            },
            message: response,
        };
        try {
            return await axios.post(`${this._url}me/messages`, requestBody, {
                headers: this._headers,
            });
        } catch (error) {
            console.error('Have error when call send api');
        } finally {
            console.log('Send message success');
            await this.sendTypingOff(senderPsid);
        }
    }

    async sendMarkSeen(senderPsid: string) {
        await this.sendAction(senderPsid, SenderAction.MARK_SEEN);
    }

    async sendTypingOn(senderPsid: string) {
        await this.sendAction(senderPsid, SenderAction.TYPING_ON);
    }

    async sendTypingOff(senderPsid: string) {
        await this.sendAction(senderPsid, SenderAction.TYPING_OFF);
    }

    async sendAction(senderPsid: string, senderAction: SenderAction) {
        const requestBody = {
            recipient: {
                id: senderPsid,
            },
            sender_action: senderAction,
        };
        try {
            return await axios.post(`${this._url}me/messages`, requestBody, {
                headers: this._headers,
            });
        } catch (error) {
            // console.log(error);
            // console.error('Have error when send action ' + senderAction);
        }
    }

    async sendQuickReply(senderPsid: string, message: string, quickReplies: QuickReply[]) {
        const response = {
            text: message,
            quick_replies: quickReplies,
        };
        await this.callSendAPI(senderPsid, response);
    }

    async sendTemplate(senderPsid: string, template: Template) {
        const response = {
            attachment: {
                type: 'template',
                payload: template,
            },
        };
        await this.callSendAPI(senderPsid, response);
    }
}
