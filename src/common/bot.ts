import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export const enum SenderAction {
    MARK_SEEN = 'mark_seen',
    TYPING_OFF = 'typing_off',
    TYPING_ON = 'typing_on',
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

export enum ButtonType {
    POSTBACK = 'postback',
    WEB_URL = 'web_url',
}

export interface Button {
    type: ButtonType;
    title: string;
    payload?: string;
    url?: string;
}

export enum TemplateType {
    BUTTON = 'button',
    GENERIC = 'generic',
    COUPON = 'coupon',
    CUSTOMER_FEEDBACK = 'customer_feedback',
    MEDIA = 'media',
    PRODUCT = 'product',
    RECEIPT = 'receipt',
    CUSTOMER_INFORMATION = 'customer_information',
}

export type QuickReplyType = 'text' | 'user_phone_number' | 'user_email';

export interface QuickReply {
    content_type: QuickReplyType;
    title?: string;
    payload?: string;
    image_url?: string;
}

export interface Template {
    template_type: TemplateType;
    text?: string;
    buttons?: Button[];
    elements?: any[];
    payload?: any;
}

export type CallToActionType = 'postback' | 'web_url';
export type CallToAction = {
    type: CallToActionType;
    title: string;
    payload?: string;
    url?: string;
    webview_height_ratio?: string;
};
export type Element = {
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: CallToAction;
    buttons?: Button[];
};
export type PersistentMenu = {
    locale: string;
    composer_input_disabled: boolean;
    call_to_actions: CallToAction[];
};

export type Greeting = {
    locale: string;
    text: string;
};

export interface MessengerBotOptions {
    pageAccessToken: string;
    apiVersion?: string;
}

export class MessengerBot {
    private _pageAccessToken: string;
    private _apiVersion: string;

    get pageAccessToken(): string {
        return this._pageAccessToken;
    }

    set pageAccessToken(value: string) {
        this._pageAccessToken = value;
    }

    get apiVersion(): string {
        return this._apiVersion;
    }

    set apiVersion(value: string) {
        this._apiVersion = value;
    }

    get axiosInstance(): AxiosInstance {
        return this._axiosInstance;
    }

    set axiosInstance(value: AxiosInstance) {
        this._axiosInstance = value;
    }

    private readonly url: string;
    private _axiosInstance: AxiosInstance;

    constructor(options: MessengerBotOptions) {
        this._pageAccessToken = options.pageAccessToken;
        this._apiVersion = options.apiVersion || 'v17.0';
        this.url = `https://graph.facebook.com/${this._apiVersion}/`;
        this._axiosInstance = axios.create({
            baseURL: this.url,
            params: {
                access_token: this._pageAccessToken,
            },
        });
    }

    private async callSendAPI(senderPsid: string, responseData: any): Promise<AxiosResponse> {
        await this.sendMarkSeen(senderPsid);
        await this.sendTypingOn(senderPsid);
        try {
            const requestBody = {
                recipient: {
                    id: senderPsid,
                },
                message: responseData,
            };
            const config: AxiosRequestConfig = {
                url: 'me/messages',
                method: 'post',
                data: requestBody,
            };
            const s = await this._axiosInstance.request(config);
            console.log(s.data + ' ' + s.status);
            return s;
        } catch (error) {
            // console.error(error.response.data);
            // throw error;
        } finally {
            await this.sendTypingOff(senderPsid); //
        }
    }

    private async sendAction(senderPsid: string, senderAction: SenderAction): Promise<AxiosResponse | void> {
        try {
            const requestBody = {
                recipient: {
                    id: senderPsid,
                },
                sender_action: senderAction,
            };
            const config: AxiosRequestConfig = {
                url: 'me/messages',
                method: 'post',
                data: requestBody,
            };
            return await this._axiosInstance.request(config);
        } catch (error) {}
    }

    async sendMessage(senderPsid: string, message: string): Promise<AxiosResponse> {
        const response = {
            text: message,
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async sendMarkSeen(senderPsid: string): Promise<AxiosResponse | void> {
        return await this.sendAction(senderPsid, SenderAction.MARK_SEEN);
    }

    async sendTypingOn(senderPsid: string): Promise<AxiosResponse | void> {
        return await this.sendAction(senderPsid, SenderAction.TYPING_ON);
    }

    async sendTypingOff(senderPsid: string): Promise<AxiosResponse | void> {
        return await this.sendAction(senderPsid, SenderAction.TYPING_OFF);
    }

    async sendQuickReply(senderPsid: string, message: string, quickReplies: QuickReply[]): Promise<AxiosResponse> {
        const response = {
            text: message,
            quick_replies: quickReplies,
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async sendTemplate(senderPsid: string, template: Template): Promise<AxiosResponse> {
        const response = {
            attachment: {
                type: 'template',
                payload: template,
            },
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async setPersistentMenu(persistentMenu: PersistentMenu[]): Promise<AxiosResponse> {
        const requestBody = {
            persistent_menu: persistentMenu,
        };
        try {
            return await this._axiosInstance.post('me/messenger_profile', requestBody);
        } catch (error) {
            console.error('Set persistent menu failed');
        }
    }

    async deletePersistentMenu(): Promise<AxiosResponse> {
        const requestBody = {
            fields: ['persistent_menu'],
        };
        try {
            return await this._axiosInstance.delete('me/messenger_profile', { data: requestBody });
        } catch (error) {
            console.error('Delete persistent menu failed');
        }
    }

    async setGetStartedButton(payload: string, greeting: Greeting[]): Promise<AxiosResponse> {
        const requestBody = {
            get_started: {
                payload: payload,
            },
            greeting: greeting,
        };
        try {
            return await this._axiosInstance.post('me/messenger_profile', requestBody);
        } catch (error) {}
    }

    async sendTemplateButton(senderPsid: string, message: string, buttons: Button[]): Promise<AxiosResponse> {
        const template: Template = {
            template_type: TemplateType.BUTTON,
            text: message,
            buttons: buttons,
        };
        return await this.sendTemplate(senderPsid, template);
    }

    async sendGenericTemplate(senderPsid: string, elements: Element[]): Promise<AxiosResponse> {
        const template: Template = {
            template_type: TemplateType.GENERIC,
            elements: elements,
        };
        return await this.sendTemplate(senderPsid, template);
    }

    async sendMediaTemplate(senderPsid: string, elements: Element[]): Promise<void> {
        // Code to send media template
    }
}
