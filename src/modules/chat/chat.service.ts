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
import { Font } from '../font/entities/font.entity';
export type ADMIN_COMMAND =
    | 'BAN'
    | 'UNBAN'
    | 'UNBAN_ALL'
    | 'BAN_LIST'
    | 'ON_BAN'
    | 'OFF_BAN'
    | 'ON_MULTIPLE_DOWNLOAD'
    | 'ON_BOT'
    | 'OFF_BOT'
    | 'UPDATE_DATA'
    | 'ADD_ADMIN'
    | 'REMOVE_ADMIN'
    | 'ADMIN_LIST'
    | 'UPDATE_PAGE_ACCESS_TOKEN'
    | 'SHOW_PAGE_ACCESS_TOKEN';
export interface AdminCommand {
    command: ADMIN_COMMAND;
    message: string;
    isSuccessful: boolean;
    error?: string;
    data?: any;
}
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
            await this.updateFontChunkCache();
            return 'Update data successfully!';
        } catch (e) {
            throw new HttpException('Có lỗi xảy ra', HttpStatus.BAD_REQUEST);
        }
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
        const keys = await this.cacheManager.get<Key[]>('keys');
        if (keys) {
            return keys;
        }
        return await this.updateKeyCache();
    }

    async getFontChunk() {
        const fontChunk = await this.cacheManager.get('fontChunk');
        if (fontChunk) {
            return fontChunk;
        }
        return await this.updateFontChunkCache();
    }

    async updateFontChunkCache() {
        const fontChunkFromDb = await this.fontService.findChunkGetString();
        await this.cacheManager.set('fontChunk', fontChunkFromDb, 100000);
        return fontChunkFromDb;
    }

    async updateKeyCache() {
        const keysFromDb = await this.keyService.findAll();
        await this.cacheManager.set('keys', keysFromDb, 100000);
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

    async unbanUser(targetUserId: any) {
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

    async getBanList() {
        return {
            command: 'BAN_LIST',
            message: 'Get ban list successfully!',
            isSuccessful: true,
            data: await this.banService.getBanList(),
        };
    }

    async enableBanFunction() {
        await this.settingService.updateSetting('BAN', 'true');
        return {
            command: 'ENABLE_BAN',
            message: 'Enable ban function successfully!',
            isSuccessful: true,
        };
    }

    async disableBanFunction() {
        await this.settingService.updateSetting('BAN', 'false');
        return {
            command: 'DISABLE_BAN',
            message: 'Disable ban function successfully!',
            isSuccessful: true,
        };
    }

    async enableMultipleDownload() {
        await this.settingService.updateSetting('MULTIPLE_DOWNLOAD', 'true');
        return {
            command: 'ENABLE_MULTIPLE_DOWNLOAD',
            message: 'Enable multiple download successfully!',
            isSuccessful: true,
        };
    }
    private async disableMultipleDownload() {
        await this.settingService.updateSetting('MULTIPLE_DOWNLOAD', 'false');
        return {
            command: 'DISABLE_MULTIPLE_DOWNLOAD',
            message: 'Disable multiple download successfully!',
            isSuccessful: true,
        };
    }

    async enableBot() {
        await this.settingService.updateSetting('BOT', 'true');
        return {
            command: 'ENABLE_BOT',
            message: 'Enable bot successfully!',
            isSuccessful: true,
        };
    }

    async disableBot() {
        await this.settingService.updateSetting('BOT', 'false');
        return {
            command: 'DISABLE_BOT',
            message: 'Disable bot successfully!',
            isSuccessful: true,
        };
    }

    async updateData() {
        await this.updateKeyCache();
        await this.updateFontChunkCache();
        return {
            command: 'UPDATE_DATA',
            message: 'Update data successfully!',
            isSuccessful: true,
        };
    }

    async addAdmin(targetUserId: any) {
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

    async removeAdmin(targetUserId: any) {
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

    async showAdminList() {
        return {
            command: 'ADMIN_LIST',
            message: 'Get admin list successfully!',
            isSuccessful: true,
            data: await this.adminService.getAdminList(),
        };
    }

    async updatePageAccessToken(token: string) {
        await this.settingService.updateSetting('PAGE_ACCESS_TOKEN', token);
        return {
            command: 'UPDATE_PAGE_ACCESS_TOKEN',
            message: 'Update page access token successfully!',
            isSuccessful: true,
        };
    }

    async showPageAccessToken() {
        return {
            command: 'PAGE_ACCESS_TOKEN',
            message: 'Get page access token successfully!',
            isSuccessful: true,
            data: await this.settingService.getValuesByKey('PAGE_ACCESS_TOKEN', 'string'),
        };
    }

    async adminFunctions(message: string) {
        const args = removeExtraSpaces(message).trim().split(' ');
        const command = args[0];
        if (args.length < 2) {
            return { error: 'Missing ban option for ban command.' };
        }
        switch (command) {
            case '@ban':
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
                break;

            case '@unban':
                const unbanOption = args[1];
                if (unbanOption === 'all') {
                    return await this.unbanAllUsers();
                } else {
                    const userId = args[1];
                    return await this.unbanUser(userId);
                }
                break;
            case '@multiple':
                if (args.length < 2) {
                    return { error: 'Missing option for multiple command.' };
                }
                const multipleOption = args[1];
                if (multipleOption === 'on') {
                    // Bật multiple download @multiple on
                    return await this.enableMultipleDownload();
                } else if (multipleOption === 'off') {
                    // Tắt multiple download @multiple off
                    return await this.disableMultipleDownload();
                }
                break;

            case '@bot':
                const botOption = args[1];
                if (botOption === 'on') {
                    // Bật bot @bot on
                    return await this.enableBot();
                } else if (botOption === 'off') {
                    return await this.disableBot();
                }
                break;

            case '@admin':
                const adminOption = args[1];
                if (adminOption === 'add') {
                    if (args.length < 3) {
                        return { error: 'Missing user ID for adding admin.' };
                    }
                    const adminUserId = args[2];
                    // Thêm admin với adminUserId @admin add <user_id>
                    await this.addAdmin(adminUserId);
                } else if (adminOption === 'remove') {
                    if (args.length < 3) {
                        return { error: 'Missing user ID for removing admin.' };
                    }
                    const adminUserId = args[2];
                    // Xóa admin với adminUserId @admin remove <user_id>
                    await this.removeAdmin(adminUserId);
                } else if (adminOption === 'list') {
                    // Lấy danh sách admin
                    return await this.showAdminList();
                }
                break;

            case '@token':
                const tokenOption = args[1];
                if (tokenOption === 'show') {
                    // Hiển thị page access token
                    return await this.showPageAccessToken();
                } else if (tokenOption === 'update') {
                    if (args.length < 3) {
                        return { error: 'Missing new token for updating access token.' };
                    }
                    const newToken = args[2];
                    // Cập nhật page access token với newToken @token update <new_token>
                    return await this.updatePageAccessToken(newToken);
                }
                break;

            case '@update':
                await this.updateData();
                return {
                    command: 'UPDATE_DATA',
                    message: 'Update data successfully!',
                    isSuccessful: true,
                };
                break;

            default:
                return { error: 'Invalid command.' };
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
                fonts.push(key.font);
                responses.push(key.response);
            }
        });
        return {
            fonts,
            responses,
        };
    }
}
