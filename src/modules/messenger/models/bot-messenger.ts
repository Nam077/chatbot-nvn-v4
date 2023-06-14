import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export const enum SenderAction {
    MARK_SEEN = 'mark_seen',
    TYPING_OFF = 'typing_off',
    TYPING_ON = 'typing_on',
}

export type UserProfileField =
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

@Injectable()
export class BotMessenger {
    private _pageAccessToken: string;
    private _apiVersion: string;
    private readonly url: string;

    constructor(private options: MessengerBotOptions, private readonly httpService: HttpService) {
        this._pageAccessToken = options.pageAccessToken;
        this._apiVersion = options.apiVersion || 'v10.0';
        this.url = `https://graph.facebook.com/${this.apiVersion}/me/`;
        this.initializeAxios();
    }

    get pageAccessToken(): string {
        return this._pageAccessToken;
    }

    set pageAccessToken(value: string) {
        this._pageAccessToken = value;
        this.initializeHeaders();
    }

    get apiVersion(): string {
        return this._apiVersion;
    }

    set apiVersion(value: string) {
        this._apiVersion = value;
    }
    private initializeAxios() {
        this.httpService.axiosRef.defaults.baseURL = this.url;
        this.initializeHeaders();
    }

    private initializeHeaders() {
        this.httpService.axiosRef.defaults.headers.common['Content-Type'] = 'application/json';
        this.httpService.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${this.pageAccessToken}`;
    }

    private async callSendAPI(senderPsid: string, responseData: any) {
        const requestBody = {
            recipient: {
                id: senderPsid,
            },
            message: responseData,
        };
        await this.sendMarkSeen(senderPsid);
        await this.sendTypingOn(senderPsid);
        try {
            return await this.httpService.axiosRef.post('messages', requestBody);
        } catch (error) {
            return;
        } finally {
            await this.sendTypingOff(senderPsid);
        }
    }

    private async sendAction(senderPsid: string, senderAction: SenderAction) {
        const requestBody = {
            recipient: {
                id: senderPsid,
            },
            sender_action: senderAction,
        };
        try {
            return await this.httpService.axiosRef.post('messages', requestBody);
        } catch (error) {
            return;
        }
    }

    async sendMessage(senderPsid: string, message: string) {
        const response = {
            text: message,
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async sendMarkSeen(senderPsid: string) {
        return await this.sendAction(senderPsid, SenderAction.MARK_SEEN);
    }

    async sendTypingOn(senderPsid: string) {
        return await this.sendAction(senderPsid, SenderAction.TYPING_ON);
    }

    async sendTypingOff(senderPsid: string) {
        return await this.sendAction(senderPsid, SenderAction.TYPING_OFF);
    }

    async sendQuickReply(senderPsid: string, message: string, quickReplies: QuickReply[]) {
        const response = {
            text: message,
            quick_replies: quickReplies,
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async sendTemplate(senderPsid: string, template: Template) {
        const response = {
            attachment: {
                type: 'template',
                payload: template,
            },
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async setPersistentMenu(persistentMenu: PersistentMenu[]) {
        const requestBody = {
            persistent_menu: persistentMenu,
        };
        try {
            return await this.httpService.axiosRef.post('me/messenger_profile', requestBody);
        } catch (error) {
            console.error('Set persistent menu failed');
            // throw error;
        }
    }

    async deletePersistentMenu() {
        const requestBody = {
            fields: ['persistent_menu'],
        };
        try {
            return await this.httpService.axiosRef.delete('me/messenger_profile', {
                data: requestBody,
            });
        } catch (error) {
            console.error('Delete persistent menu failed');
        }
    }

    async setGetStartedButton(payload: string, greeting: Greeting[]) {
        const requestBody = {
            get_started: {
                payload: payload,
            },
            greeting: greeting,
        };
        try {
            return await this.httpService.axiosRef.post('me/messenger_profile', requestBody);
        } catch (error) {}
    }

    async sendTemplateButton(senderPsid: string, message: string, buttons: Button[]) {
        const template: Template = {
            template_type: TemplateType.BUTTON,
            text: message,
            buttons: buttons,
        };
        return await this.sendTemplate(senderPsid, template);
    }

    async sendGenericTemplate(senderPsid: string, elements: Element[]) {
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
