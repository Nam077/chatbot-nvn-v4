import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export interface KeyI {
    name: string;
    value: string;
}

export interface ImageI {
    url: string;
}

export interface MessageI {
    value: string;
}

export interface LinkI {
    url: string;
}

export interface TagI {
    name: string;
}

export interface FontExcel {
    name: string;
    keys: KeyI[];
    images: ImageI[];
    messages: MessageI[];
    links: LinkI[];
    urlPost: string;
    description: string;
    tags: TagI[];
}
export interface FontExcels {
    fonts: FontExcel[];
    keys: KeyI[];
    images: ImageI[];
    messages: MessageI[];
    links: LinkI[];
    tags: TagI[];
}
export interface ResponseExcels {
    responses: ResponseExcel[];
    keys: KeyI[];
    images: ImageI[];
    messages: MessageI[];
    links: LinkI[];
    tags: TagI[];
}
export interface DataRowExcel {
    keys: KeyI[];
    images: ImageI[];
    messages: MessageI[];
    links: LinkI[];
    tags: TagI[];
}

export interface ResponseExcel {
    name: string;
    keys: KeyI[];
    images: ImageI[];
    messages: MessageI[];
    links: LinkI[];
    tags: TagI[];
}

export interface DataSheet {
    fonts: FontExcel[];
    responses: ResponseExcel[];
    keys: KeyI[];
    messages: MessageI[];
    images: ImageI[];
    links: LinkI[];
    tags: TagI[];
}

export interface DataExcel {
    keys: KeyI[] | null;
    messages: MessageI[] | null;
    images: ImageI[] | null;
    links: LinkI[] | null;
    tags: TagI[] | null;
}

const URL_FAN_PAGE = 'https://www.facebook.com/nvnfont/';
@Injectable({})
export class GoogleSheetService {
    private keys: KeyI[] = [];
    private images: ImageI[] = [];
    private messages: MessageI[] = [];
    private links: LinkI[] = [];
    private tags: TagI[] = [];

    private keyCheck: Record<string, boolean> = {};
    private imageCheck: Record<string, boolean> = {};
    private messageCheck: Record<string, boolean> = {};
    private linkCheck: Record<string, boolean> = {};
    private tagCheck: Record<string, boolean> = {};
    private doc: GoogleSpreadsheet;
    constructor(private readonly configService: ConfigService) {}
    private async initSheet(): Promise<void> {
        try {

            this.doc = new GoogleSpreadsheet(this.configService.get<string>('GOOGLE_SHEET_ID'),  {apiKey:this.configService.get<string>('GOOGLE_SHEET_PRIVATE_KEY').replace(/\\\\n/g, '\n')});
            await this.doc.loadInfo();
        } catch (error) {
            console.log(error);
        }
    }

    private async getSheet(): Promise<GoogleSpreadsheet> {
        if (!this.doc) {
            await this.initSheet();
        }
        return this.doc;
    }

    async getData(): Promise<DataSheet> {
        const doc = await this.getSheet();
        const sheetFont: GoogleSpreadsheetWorksheet = doc.sheetsByIndex[0];
        const sheetResponse: GoogleSpreadsheetWorksheet = doc.sheetsByIndex[1];
        const rowsFont: GoogleSpreadsheetRow[] = await sheetFont.getRows();
        const rowsResponse: GoogleSpreadsheetRow[] = await sheetResponse.getRows();
        const fonts: FontExcel[] = this.getFonts(rowsFont);
        const responses: ResponseExcel[] = this.getResponses(rowsResponse);

        return {
            fonts: fonts,
            responses: responses,
            keys: this.keys,
            messages: this.messages,
            images: this.images,
            links: this.links,
            tags: this.tags,
        };
    }

    private getFonts(rowsFont: GoogleSpreadsheetRow[]): FontExcel[] {
        const fonts: FontExcel[] = [];

        rowsFont.forEach((rowFont: GoogleSpreadsheetRow) => {
            if (rowFont.get('Name') && rowFont.get('Name') !== '') {
                const font: FontExcel = this.getDataRowFont(rowFont);
                fonts.push(font);

                font.keys.forEach((key: KeyI) => {
                    const value: string = key.value;
                    if (!this.keyCheck[value]) {
                        this.keys.push(key);
                        this.keyCheck[value] = true;
                    }
                });

                font.images.forEach((image: ImageI) => {
                    const url: string = image.url;
                    if (!this.imageCheck[url]) {
                        this.images.push(image);
                        this.imageCheck[url] = true;
                    }
                });

                font.messages.forEach((message: MessageI) => {
                    const value: string = message.value;
                    if (!this.messageCheck[value]) {
                        this.messages.push(message);
                        this.messageCheck[value] = true;
                    }
                });

                font.links.forEach((link: LinkI) => {
                    const url: string = link.url;
                    if (!this.linkCheck[url]) {
                        this.links.push(link);
                        this.linkCheck[url] = true;
                    }
                });

                font.tags.forEach((tag: TagI) => {
                    const name: string = tag.name;
                    if (!this.tagCheck[name]) {
                        this.tags.push(tag);
                        this.tagCheck[name] = true;
                    }
                });
            }
        });

        return fonts;
    }

    private getResponses(rowsResponse: GoogleSpreadsheetRow[]): ResponseExcel[] {
        const responses: ResponseExcel[] = [];

        rowsResponse.forEach((rowResponse: GoogleSpreadsheetRow, index) => {
            const response: ResponseExcel = this.getDataRowResponse(rowResponse, index);
            responses.push(response);
            response.keys.forEach((key: KeyI) => {
                const value: string = key.value;
                if (!this.keyCheck[value]) {
                    this.keys.push(key);
                    this.keyCheck[value] = true;
                }
            });

            response.images.forEach((image: ImageI) => {
                const url: string = image.url;
                if (!this.imageCheck[url]) {
                    this.images.push(image);
                    this.imageCheck[url] = true;
                }
            });

            response.messages.forEach((message: MessageI) => {
                const value: string = message.value;
                if (!this.messageCheck[value]) {
                    this.messages.push(message);
                    this.messageCheck[value] = true;
                }
            });

            response.links.forEach((link: LinkI) => {
                const url: string = link.url;
                if (!this.linkCheck[url]) {
                    this.links.push(link);
                    this.linkCheck[url] = true;
                }
            });

            response.tags.forEach((tag: TagI) => {
                const name: string = tag.name;
                if (!this.tagCheck[name]) {
                    this.tags.push(tag);
                    this.tagCheck[name] = true;
                }
            });
        });

        return responses;
    }

    public getDataRowFont(rowFont: GoogleSpreadsheetRow): FontExcel {
        const name: string = this.removeExtraSpaces(rowFont.get('Name'));
        const urlPost: string = (rowFont.get('Post_Link') ?? URL_FAN_PAGE).trim();
        const description: string = this.removeExtraSpaces(rowFont.get('Description') ?? `Bộ font ${name} của NVN Font`);
        return {
            name,
            urlPost,
            description,
            ...this.getDataFromRow(rowFont),
        };
    }

    private getDataRowResponse(rowResponse: GoogleSpreadsheetRow, index: number): ResponseExcel {
        const name = `Response ${index + 1}`;
        return {
            name,
            ...this.getDataFromRow(rowResponse),
        };
    }
    private getDataFromRow(row: GoogleSpreadsheetRow): DataRowExcel {
        const keys: KeyI[] = [];
        const images: ImageI[] = [];
        const messages: MessageI[] = [];
        const links: LinkI[] = [];
        const tags: TagI[] = [];

        const keyCheck: Set<string> = new Set<string>();
        const imageCheck: Set<string> = new Set<string>();
        const messageCheck: Set<string> = new Set<string>();
        const linkCheck: Set<string> = new Set<string>();
        const tagCheck: Set<string> = new Set<string>();

        if (row.get('Keys')) {
            const keysTemp: string[] = row.get('Keys').split('\n')
                .map((key: string) => key.trim())
                .filter((key: string) => key !== '');
            keysTemp.forEach((key: string) => {
                const value: string = this.removeAllSpecialCharacters(key).toLowerCase();
                if (!keyCheck.has(value)) {
                    keys.push({
                        name: this.removeAllSpecialCharacters(key),
                        value: this.removeAllSpecialCharacters(key).toLowerCase(),
                    });
                    keyCheck.add(value);
                }
            });
            if (keys.length === 0) {
                keys.push({
                    name: this.removeAllSpecialCharacters(row.get('Name')),
                    value: this.removeAllSpecialCharacters(row.get('Name')).toLowerCase(),
                });
            }
        }
        if (row.get('Images')) {
            const imagesTemp: string[] = row.get('Images').split('\n')
                .map((image: string) => image.trim())
                .filter((image: string) => image !== '');
            imagesTemp.forEach((image: string) => {
                if (!imageCheck.has(image)) {
                    images.push({
                        url: image,
                    });
                    imageCheck.add(image);
                }
            });
        }
        if (row.get('Messages')) {
            const messagesTemp: string[] = row.get('Messages').split('---split---')
                .map((message: string) => message.trim())
                .filter((message: string) => message !== '');
            messagesTemp.forEach((message: string) => {
                const value: string = this.removeExtraSpaces(message);
                if (!messageCheck.has(value)) {
                    messages.push({
                        value: value,
                    });
                    messageCheck.add(value);
                }
            });
            if (messages.length === 0) {
                messages.push({
                    value: `Bộ font ${row.get('Name')} của NVN Font`,
                });
            }
        }
        if (row.get('Links')) {
            const linksTemp: string[] = row.get('Links').split('\n')
                .map((link: string) => link.trim())
                .filter((link: string) => link !== '');
            linksTemp.forEach((link: string) => {
                if (!linkCheck.has(link)) {
                    links.push({
                        url: link,
                    });
                    linkCheck.add(link);
                }
            });
        }
        if (row.get('Tags')) {
            const tagsTemp: string[] = row.get('Tags').split(',')
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag !== '');
            tagsTemp.forEach((tag: string) => {
                const value: string = this.removeExtraSpaces(this.removeAllSpecialCharacters(tag));
                if (!tagCheck.has(value)) {
                    tags.push({
                        name: tag,
                    });
                    tagCheck.add(value);
                }
            });
        }
        return {
            keys: keys,
            images: images,
            messages: messages,
            links: links,
            tags: tags,
        };
    }
    removeAllSpecialCharacters(str: string): string {
        return str.replace(/[^\p{L}\d\s]/gu, '').trim();
    }
    removeExtraSpaces(str: string): string {
        return str.trim().replace(/\s+/g, ' ');
    }
}
