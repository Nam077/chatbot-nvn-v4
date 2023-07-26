import { Injectable } from '@nestjs/common';
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

export type UserInformation = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    profilePic: string;
    locale?: string;
    timezone?: number;
    gender?: string;
};

export type ButtonType = 'web_url' | 'postback';

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
    default_action?: DefaultAction;
    buttons?: Button[];
};
export interface Button {
    type: ButtonType;
    title: string;
    payload?: string;
    url?: string;
}
export type DefaultAction = {
    type: 'web_url';
    url: string;
    messenger_extensions?: boolean;
    fallback_url?: string;
    webview_height_ratio?: 'compact' | 'tall' | 'full';
    webview_share_button?: 'hide';
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
        this._pageAccessToken = options.pageAccessToken.trim();
        this._apiVersion = options.apiVersion || 'v10.0';
        this.url = `https://graph.facebook.com/${this.apiVersion}/`;
        this.initializeAxios();
    }

    get pageAccessToken(): string {
        return this._pageAccessToken;
    }

    set pageAccessToken(value: string) {
        this._pageAccessToken = value.trim();
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
            await this.httpService.axiosRef.post('me/messages', requestBody);
        } catch (error) {
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
            return await this.httpService.axiosRef.post('me/messages', requestBody);
        } catch (error) {}
    }

    async sendTextMessage(senderPsid: string, message: string) {
        const response = {
            text: message,
        };
        return await this.callSendAPI(senderPsid, response);
    }

    async sendImageMessage(senderPsid: string, imageUrl: string) {
        const response = {
            attachment: {
                type: 'image',
                payload: {
                    url: imageUrl,
                    is_reusable: true,
                },
            },
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
        } catch (error) {}
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

    async sendGenericMessage(senderPsid: string, elements: Element[]) {
        const template: Template = {
            template_type: TemplateType.GENERIC,
            elements: elements,
        };
        return await this.sendTemplate(senderPsid, template);
    }

    async sendMediaTemplate(senderPsid: string, elements: Element[]): Promise<void> {
        // Code to send media template
    }

    async getUserProfile(
        senderPsid: string,
        fields: UserProfileField[] = ['id', 'name', 'first_name', 'last_name', 'profile_pic'],
    ): Promise<UserInformation> {
        try {
            const response = await this.httpService.axiosRef.get(`/${senderPsid}`, {
                params: {
                    fields: fields.join(','),
                },
            });
            return {
                id: response.data.id,
                firstName: response.data.first_name,
                lastName: response.data.last_name,
                name: response.data.name,
                profilePic: response.data.profile_pic,
                gender: response.data.gender || 'neutral',
                locale: response.data.locale || 'vi_VN',
                timezone: response.data.timezone || 7,
            };
        } catch (error) {
            return {
                id: senderPsid,
                firstName: 'Bạn',
                lastName: 'Bạn',
                name: 'Bạn',
                profilePic: '',
            };
        }
    }

    async sendMultipleTextMessage(senderPsid: string, data: string[]) {
        for (const message of data) {
            await this.sendTextMessage(senderPsid, message);
        }
    }

    async sendButtonMessage(senderPsid: string, message: string, buttons: Button[]) {
        const template: Template = {
            template_type: TemplateType.BUTTON,
            text: message,
            buttons: buttons,
        };
        return await this.sendTemplate(senderPsid, template);
    }
}
