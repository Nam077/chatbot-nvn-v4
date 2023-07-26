import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSheet, GoogleSheetService } from './google-sheet/google-sheet.service';
import { KeyService } from '../key/key.service';
import { MessageService } from '../message/message.service';
import { LinkService } from '../link/link.service';
import { FontService } from '../font/font.service';
import { ResponseService } from '../response/response.service';
import { Key } from '../key/entities/key.entity';
import { TagService } from '../tag/tag.service';
import { ImageService } from '../image/image.service';
import { Link } from '../link/entities/link.entity';
import { Message } from '../message/entities/message.entity';
import { Tag } from '../tag/entities/tag.entity';
import { Image } from '../image/entities/image.entity';
import { CrawDataGoogle, CrawDataLucky, CrawDataYoutube, CrawlerService } from './crawler/crawler.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BanService } from '../ban/ban.service';
import { ResponseLocal } from '../../interfaces/response-local';
import { Ban } from '../ban/entities/ban.entity';
import { SettingService } from '../setting/setting.service';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/entities/admin.entity';
import { removeExtraSpaces } from '../../utils/string';
import { Response } from '../response/entities/response.entity';
import { Font, FontStatus } from '../font/entities/font.entity';
import { getTimeCurrent, TimeCurrent } from '../../utils/time';
import { FoodService } from '../food/food.service';
import { Food } from '../food/entities/food.entity';

enum KeyEnum {
    FONT = 'FONT',
    KEY = 'KEY',
    FONT_CHUNK_STRING = 'FONT_CHUNK_STRING',
    FONT_CHUNK = 'FONT_CHUNK',
    BAN_STATUS = 'BAN_STATUS',
    ADMIN_LIST = 'ADMIN_LIST',
    BOT_STATUS = 'BOT_STATUS',
    MULTIPLE_DOWNLOAD_STATUS = 'MULTIPLE_DOWNLOAD_STATUS',
}
export type DataFromMessage = {
    fonts: Font[];
    responses: Response[];
};
export type ADMIN_COMMAND =
    | 'BAN'
    | 'UNBAN'
    | 'UNBAN_ALL'
    | 'BAN_LIST'
    | 'ON_BAN'
    | 'OFF_BAN'
    | 'ON_MULTIPLE_DOWNLOAD'
    | 'OFF_MULTIPLE_DOWNLOAD'
    | 'ON_BOT'
    | 'OFF_BOT'
    | 'UPDATE_DATA'
    | 'ADD_ADMIN'
    | 'REMOVE_ADMIN'
    | 'ADMIN_LIST'
    | 'UPDATE_PAGE_ACCESS_TOKEN'
    | 'SHOW_PAGE_ACCESS_TOKEN'
    | 'ADMIN_ERROR';

export interface AdminCommand {
    command: ADMIN_COMMAND;
    message: string;
    isSuccessful: boolean;
    error?: string;
    data?: any;
}
const CACHE_TTL_MILLISECOND: number = 1000 * 60 * 60 * 24 * 7; // 7 days
@Injectable()
export class ChatService {
    constructor(
        private readonly googleSheetService: GoogleSheetService,
        private readonly keyService: KeyService,
        private readonly messageService: MessageService,
        private readonly linkService: LinkService,
        private readonly responseService: ResponseService,
        private readonly fontService: FontService,
        private readonly tagService: TagService,
        private readonly imageService: ImageService,
        private readonly crawlerService: CrawlerService,
        private readonly banService: BanService,
        private readonly settingService: SettingService,
        private readonly adminService: AdminService,
        private readonly foodService: FoodService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}
    async updateDataFromGoogleSheet() {
        try {
            const data: DataSheet = await this.googleSheetService.getData();
            const { keys, images, links, tags, messages, responses, fonts } = data;
            const keyRecord: Record<string, Key> = await this.keyService.createMultiple(keys, true);
            const linkRecord: Record<string, Link> = await this.linkService.createMultiple(links, true);
            const messageRecord: Record<string, Message> = await this.messageService.createMultiple(messages, true);
            const tagRecord: Record<string, Tag> = await this.tagService.createMultiple(tags, true);
            const imageRecord: Record<string, Image> = await this.imageService.createMultiple(images, true);
            const createFontDtos = fonts.map((font) => {
                const { name, urlPost, description, keys, messages, images, tags, links } = font;
                const keyFont = keys.map((key) => keyRecord[key.value]);
                const messageFont = messages.map((message) => messageRecord[message.value]);
                const imageFont = images.map((image) => imageRecord[image.url]);
                const tagFont = tags.map((tag) => tagRecord[tag.name]);
                const linkFont = links.map((link) => linkRecord[link.url]);

                return {
                    name,
                    urlPost,
                    description,
                    keys: keyFont,
                    messages: messageFont,
                    images: imageFont,
                    tags: tagFont,
                    links: linkFont,
                    slug: name,
                };
            });
            const responseCreateDtos = responses.map((response) => {
                const { name, keys, images, tags, messages, links } = response;
                const keyResponse = keys.map((key) => keyRecord[key.value]);
                const messageResponse = messages.map((message) => messageRecord[message.value]);
                const imageResponse = images.map((image) => imageRecord[image.url]);
                const tagResponse = tags.map((tag) => tagRecord[tag.name]);
                const linkResponse = links.map((link) => linkRecord[link.url]);
                return {
                    name: name,
                    keys: keyResponse,
                    messages: messageResponse,
                    images: imageResponse,
                    tags: tagResponse,
                    links: linkResponse,
                };
            });
            await this.fontService.createMultiple(createFontDtos, true);
            await this.responseService.createMultiple(responseCreateDtos, true);
            await this.updateKeyCache();
            await this.updateFontChunkStringCache();
            await this.updateFontChunkCache(10);
            return 'Update data successfully!';
        } catch (e) {
            throw new HttpException('Có lỗi xảy ra', HttpStatus.BAD_REQUEST);
        }
    }

    async getAdmins(): Promise<string[]> {
        const admins = await this.cacheManager.get<string[]>(KeyEnum.ADMIN_LIST);
        if (admins) {
            return admins;
        }
        return await this.updateAdminCache();
    }

    async updateAdminCache(): Promise<string[]> {
        const admins = (await this.adminService.findAll()).map((admin) => admin.senderPsid);
        await this.cacheManager.set(KeyEnum.ADMIN_LIST, admins, CACHE_TTL_MILLISECOND);
        return admins;
    }

    async crawlerFromGoogleSearch(key: string): Promise<CrawDataGoogle[]> {
        return await this.crawlerService.crawlerFromGoogleSearch(key);
    }

    async getYouTubeSearch(key: string): Promise<CrawDataYoutube[]> {
        return await this.crawlerService.getYoutube(key);
    }

    async getXSMB(): Promise<string> {
        return await this.crawlerService.crawlerXSMB();
    }

    getLuckyNumber(str: string): CrawDataLucky {
        return this.crawlerService.getLuckyNumber(str);
    }

    async getKeys(): Promise<Key[]> {
        const keys = await this.cacheManager.get<Key[]>(KeyEnum.KEY);
        if (keys) {
            return keys;
        }
        return await this.updateKeyCache();
    }

    async getFontChunkString(): Promise<string[][]> {
        const fontChunk = await this.cacheManager.get<string[][]>(KeyEnum.FONT_CHUNK_STRING);
        if (fontChunk) {
            return fontChunk;
        }
        return await this.updateFontChunkStringCache();
    }

    async updateFontChunkStringCache() {
        const fontChunkFromDb = await this.fontService.findChunkGetString();
        await this.cacheManager.set(KeyEnum.FONT_CHUNK_STRING, fontChunkFromDb, CACHE_TTL_MILLISECOND);
        return fontChunkFromDb;
    }

    async updateKeyCache() {
        const keysFromDb = await this.keyService.findAll();
        await this.cacheManager.set(KeyEnum.KEY, keysFromDb, CACHE_TTL_MILLISECOND);
        return keysFromDb;
    }

    async getBanner() {
        return await this.banService.getBanList();
    }

    async unbanAllUsers(): Promise<AdminCommand> {
        await this.banService.unbanAll();
        return {
            command: 'UNBAN_ALL',
            message: 'Unban all users successfully!',
            isSuccessful: true,
        };
    }

    async updateBanNameBySenderPsid(senderPsid: string, name: string): Promise<string> {
        const response: ResponseLocal<Ban> = await this.banService.updateBanNameBySenderPsid(senderPsid, name);
        if (response.isSuccess) {
            return `Update ban name for user ${senderPsid} successfully!`;
        }
        return response.message;
    }

    async banUser(targetUserId: string, reason = `Admin ban`): Promise<AdminCommand> {
        const response: ResponseLocal<Ban> = await this.banService.ban({
            name: targetUserId,
            senderPsid: targetUserId,
            reason: reason,
        });
        if (response.isSuccess) {
            return {
                command: 'BAN',
                message: `Ban user ${targetUserId} successfully!`,
                isSuccessful: true,
                data: response.data,
            };
        }
        return {
            command: 'BAN',
            message: response.message,
            isSuccessful: false,
        };
    }

    async unbanUser(targetUserId: any): Promise<AdminCommand> {
        const response: ResponseLocal<Ban> = await this.banService.unban(targetUserId);
        if (response.isSuccess) {
            return {
                command: 'UNBAN',
                message: `Unban user ${targetUserId} successfully!`,
                isSuccessful: true,
                data: response.data,
            };
        }
        return {
            command: 'UNBAN',
            message: response.message,
            isSuccessful: false,
        };
    }

    async getBanList(): Promise<AdminCommand> {
        return {
            command: 'BAN_LIST',
            message: 'Get ban list successfully!',
            isSuccessful: true,
            data: await this.banService.getBanList(),
        };
    }

    async enableBanFunction(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.BAN_STATUS, 'true');
        return {
            command: 'ON_BAN',
            message: 'Enable ban function successfully!',
            isSuccessful: true,
        };
    }

    async disableBanFunction(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.BAN_STATUS, 'false');
        return {
            command: 'OFF_BAN',
            message: 'Disable ban function successfully!',
            isSuccessful: true,
        };
    }

    async enableMultipleDownload(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.MULTIPLE_DOWNLOAD_STATUS, 'true');
        return {
            command: 'ON_MULTIPLE_DOWNLOAD',
            message: 'Enable multiple download successfully!',
            isSuccessful: true,
        };
    }

    private async disableMultipleDownload(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.MULTIPLE_DOWNLOAD_STATUS, 'false');
        return {
            command: 'OFF_MULTIPLE_DOWNLOAD',
            message: 'Disable multiple download successfully!',
            isSuccessful: true,
        };
    }

    async enableBot(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.BOT_STATUS, 'true');
        return {
            command: 'ON_BOT',
            message: 'Enable bot successfully!',
            isSuccessful: true, //
        };
    }

    async disableBot(): Promise<AdminCommand> {
        await this.settingService.updateSetting(KeyEnum.BOT_STATUS, 'false');
        return {
            command: 'OFF_BOT',
            message: 'Disable bot successfully!',
            isSuccessful: true,
        };
    }

    async updateData(): Promise<AdminCommand> {
        await this.updateDataFromGoogleSheet();
        return {
            command: 'UPDATE_DATA',
            message: 'Update data successfully!',
            isSuccessful: true,
        };
    }

    async addAdmin(targetUserId: string): Promise<AdminCommand> {
        const response: ResponseLocal<Admin> = await this.adminService.addAdmin(targetUserId);
        if (response.isSuccess) {
            return {
                command: 'ADD_ADMIN',
                message: `Add admin ${targetUserId} successfully!`,
                isSuccessful: true,
                data: response.data,
            };
        }
        return {
            command: 'ADD_ADMIN',
            message: response.message,
            isSuccessful: false,
        };
    }

    async removeAdmin(targetUserId: string): Promise<AdminCommand> {
        const response: ResponseLocal<Admin> = await this.adminService.removeAdmin(targetUserId);
        if (response.isSuccess) {
            return {
                command: 'REMOVE_ADMIN',
                message: `Remove admin ${targetUserId} successfully!`,
                isSuccessful: true,
                data: response.data,
            };
        }
        return {
            command: 'REMOVE_ADMIN',
            message: response.message,
            isSuccessful: false,
        };
    }

    async showAdminList(): Promise<AdminCommand> {
        return {
            command: 'ADMIN_LIST',
            message: 'Get admin list successfully!',
            isSuccessful: true,
            data: await this.adminService.getAdminList(),
        };
    }

    async updatePageAccessToken(token: string): Promise<AdminCommand> {
        await this.settingService.updateSetting('PAGE_ACCESS_TOKEN', token);
        return {
            command: 'UPDATE_PAGE_ACCESS_TOKEN',
            message: 'Update page access token successfully!',
            isSuccessful: true,
            data: token,
        };
    }

    async showPageAccessToken(): Promise<AdminCommand> {
        return {
            command: 'SHOW_PAGE_ACCESS_TOKEN',
            message: 'Get page access token successfully!',
            isSuccessful: true,
            data: await this.settingService.getValuesByKey('PAGE_ACCESS_TOKEN', 'string'),
        };
    }

    async adminFunctions(message: string): Promise<AdminCommand> {
        const args = removeExtraSpaces(message).trim().split(' ');
        const command = args[0];
        if (args.length < 2) {
            return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
        }
        switch (command) {
            case '@ban':
                console.log('ban');
                const banOption = args[1];
                // Xử lý chức năng ban user
                if (banOption === 'list') {
                    // Lấy danh sách ban @ban list
                    return await this.getBanList();
                } else if (banOption === 'on') {
                    // Bật chế độ ban @ban on
                    return await this.enableBanFunction();
                } else if (banOption === 'off') {
                    // Tắt chế độ ban @ban off
                    return await this.disableBanFunction();
                } else {
                    //@ban  @ban <user_id>  or <user_id> <reason>
                    if (args.length > 2) {
                        const userId = args[1];
                        const reason = args[2];
                        return await this.banUser(userId, reason);
                    } else {
                        const userId = args[1];
                        // Ban user theo userId @ban <user_id>
                        return await this.banUser(userId);
                    }
                }

            case '@unban':
                const unbanOption = args[1];
                if (unbanOption === 'all') {
                    return await this.unbanAllUsers();
                } else {
                    const userId = args[1];
                    return await this.unbanUser(userId);
                }
            case '@multiple':
                if (args.length < 2) {
                    return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
                }
                const multipleOption = args[1];
                if (multipleOption === 'on') {
                    // Bật multiple download @multiple on
                    const result = await this.enableMultipleDownload();
                    await this.updateMultipleDownloadStatus();
                    return result;
                } else if (multipleOption === 'off') {
                    // Tắt multiple download @multiple off
                    const result = await this.disableMultipleDownload();
                    await this.updateMultipleDownloadStatus();
                    return result;
                } else {
                    return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
                }

            case '@bot':
                const botOption = args[1];
                if (botOption === 'on') {
                    const result = await this.enableBot();
                    await this.updateBotStatus();
                    return result;
                } else if (botOption === 'off') {
                    const result = await this.disableBot();
                    await this.updateBotStatus();
                    return result;
                } else {
                    return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
                }
            case '@admin':
                const adminOption = args[1];
                if (adminOption === 'add') {
                    if (args.length < 3) {
                        return {
                            command: 'ADMIN_ERROR',
                            message: 'Missing user ID for adding admin.',
                            isSuccessful: false,
                        };
                    }
                    const adminUserId = args[2];
                    const result = await this.addAdmin(adminUserId);
                    await this.updateAdminCache();
                    return result;
                } else if (adminOption === 'remove') {
                    if (args.length < 3) {
                        return {
                            command: 'ADMIN_ERROR',
                            message: 'Missing user ID for removing admin.',
                            isSuccessful: false,
                        };
                    }
                    const adminUserId = args[2];
                    // Xóa admin với adminUserId @admin remove <user_id>
                    const result = await this.removeAdmin(adminUserId);
                    await this.updateAdminCache();
                    return result;
                } else if (adminOption === 'list') {
                    // Lấy danh sách admin
                    return await this.showAdminList();
                } else {
                    return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
                }
            case '@token':
                const tokenOption = args[1];
                if (tokenOption === 'show') {
                    // Hiển thị page access token
                    return await this.showPageAccessToken();
                } else if (tokenOption === 'update') {
                    if (args.length < 3) {
                        return { command: 'ADMIN_ERROR', message: 'Missing new token.', isSuccessful: false };
                    }
                    const newToken = args[2];
                    // Cập nhật page access token với newToken @token update <new_token>
                    return await this.updatePageAccessToken(newToken);
                } else {
                    return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
                }

            case '@update':
                await this.updateData();
                return {
                    command: 'UPDATE_DATA',
                    message: 'Update data successfully!',
                    isSuccessful: true,
                };
            default:
                return { command: 'ADMIN_ERROR', message: 'Invalid command!', isSuccessful: false };
        }
    }

    async getDataFromMessage(message: string): Promise<{
        fonts: Font[];
        responses: Response[];
    }> {
        const keys: Key[] = await this.getKeys();
        const fonts: Font[] = [];
        const responses: Response[] = [];
        keys.forEach((key: Key) => {
            if (message.toLowerCase().includes(key.value)) {
                if (key.font) {
                    fonts.push(key.font);
                }
                if (key.response) {
                    responses.push(key.response);
                }
            }
        });
        return {
            fonts: (await this.getMultipleDownloadStatus()) === true ? fonts : fonts.length > 0 ? [fonts[0]] : [],
            responses,
        };
    }

    async checkBanned(senderPsid: string): Promise<{
        ban?: Ban;
        isBanned: boolean;
    }> {
        if (await this.isAdmin(senderPsid)) {
            return {
                isBanned: false,
            };
        }
        const ban: Ban = await this.banService.findOneBySenderPsid(senderPsid);
        if (ban) {
            return {
                isBanned: true,
                ban,
            };
        }
        const { hour }: TimeCurrent = getTimeCurrent();

        if (await this.getBanStatus()) {
            if (hour >= 22 || hour < 6) {
                const newBan = await this.banService.ban({
                    senderPsid: senderPsid,
                    reason: 'Nhắn tin ngoài giờ cho phép',
                    name: senderPsid,
                });
                return {
                    ban: newBan.data,
                    isBanned: true,
                };
            }
        } else {
            return {
                ban,
                isBanned: false,
            };
        }
    }

    async getBanStatus(): Promise<boolean> {
        const value = await this.cacheManager.get<boolean>(KeyEnum.BAN_STATUS);
        if (value) {
            return value;
        }
        return await this.updateBanStatus();
    }

    private async updateBanStatus(): Promise<boolean> {
        const banStatus = await this.settingService.getValueByKeyBoolean(KeyEnum.BAN_STATUS);
        await this.cacheManager.set(KeyEnum.BAN_STATUS, banStatus, CACHE_TTL_MILLISECOND);
        return banStatus;
    }

    async getFontChunk(chunk = 10): Promise<Font[][]> {
        const fontChunk = await this.cacheManager.get<Font[][]>(KeyEnum.FONT_CHUNK);
        if (fontChunk) {
            return fontChunk;
        }
        return await this.updateFontChunkCache(chunk);
    }

    private async updateFontChunkCache(chunk: number): Promise<Font[][]> {
        const fontChunk = await this.fontService.findChunk(chunk);
        await this.cacheManager.set(KeyEnum.FONT_CHUNK, fontChunk, CACHE_TTL_MILLISECOND);
        return fontChunk;
    }

    async deleteBanned(senderPsid) {
        await this.banService.deleteBySenderPsid(senderPsid);
    }

    async getBotStatus(): Promise<boolean> {
        const value = await this.cacheManager.get<boolean>(KeyEnum.BOT_STATUS);
        if (value) {
            return value;
        }
        return await this.updateBotStatus();
    }

    private async updateBotStatus(): Promise<boolean> {
        const botStatus = await this.settingService.getValueByKeyBoolean(KeyEnum.BOT_STATUS);
        await this.cacheManager.set(KeyEnum.BOT_STATUS, botStatus, CACHE_TTL_MILLISECOND);
        return botStatus;
    }

    private async getMultipleDownloadStatus(): Promise<boolean> {
        const value = await this.cacheManager.get<boolean>(KeyEnum.MULTIPLE_DOWNLOAD_STATUS);
        if (value) {
            return value;
        }
        return await this.updateMultipleDownloadStatus();
    }

    private async updateMultipleDownloadStatus(): Promise<boolean> {
        const multipleDownloadStatus = await this.settingService.getValueByKeyBoolean(KeyEnum.MULTIPLE_DOWNLOAD_STATUS);
        await this.cacheManager.set(KeyEnum.MULTIPLE_DOWNLOAD_STATUS, multipleDownloadStatus, CACHE_TTL_MILLISECOND);
        return multipleDownloadStatus;
    }

    async isAdmin(senderPsid: string): Promise<boolean> {
        return (await this.getAdmins()).includes(senderPsid);
    }

    async getRandomFood(): Promise<Food> {
        return await this.foodService.getRandomFood();
    }

    async updateStatusFont(fontId: number) {
        const results = await this.fontService.updateStatus(fontId);
        const { isSuccess, font } = results;
        if (isSuccess) {
            await this.updateFontChunkCache(10);
            await this.updateKeyCache();
        }
        return results;
    }
}
