import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as yt from 'youtube-search-without-api-key';
import * as cheerio from 'cheerio';

export interface CrawDataGoogle {
    type: string;
    data: string | string[];
}

export interface CrawDataYoutube {
    title: string;
    url: string;
    duration: string;
    thumbnail: string;
    views: string;
}

export interface CrawDataLucky {
    title: string;
    data: string | string[];
    message?: string;
}

@Injectable()
export class CrawlerService {
    private readonly header = {
        'Content-Type': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
    };

    constructor(private readonly httpService: HttpService) {}
    public crawlerFromGoogleSearch = async (key: string): Promise<CrawDataGoogle[]> => {
        const dataCrawler: CrawDataGoogle[] = [];
        try {
            //replace all space in message
            let messageCheck = key.replace(/\s/g, '');
            messageCheck = this.stripAccent(messageCheck);
            if (messageCheck.includes('cov' || 'covid' || 'corona' || 'cô vi' || 'corona')) {
                return;
            }
            const encodedString = encodeURI(key);
            const url = `https://www.google.com.vn/search?q=${encodedString}&hl=vi&gl=VN`;
            const response = await this.httpService
                .get(url, {
                    headers: this.header,
                })
                .toPromise();

            const data = response.data;
            const $ = cheerio.load(data);
            // return data;
            const informationDefault = $(data).find('span.hgKElc').text();
            if (informationDefault != null && informationDefault !== '') {
                dataCrawler.push({
                    type: 'informationDefault',
                    data: informationDefault,
                });
            }
            //Hỏi thông tin về năm sinh
            const year = $(data).find('div.Z0LcW').text();
            if (year != null && year !== '') {
                dataCrawler.push({
                    type: 'year',
                    data: year,
                });
            }
            const checkWeather: string = $(data).find('span#wob_tm').text();

            if (checkWeather != null && checkWeather !== '') {
                const weather =
                    `Thời tiết hiện tại tại: ${$(data).find('div#wob_loc').text()}\n` +
                    `Nhiệt độ: ${$(data).find('span#wob_tm').text()} °C\n` +
                    `Bầu trời: ${$(data).find('span#wob_dc').text()}\n` +
                    `Khả năng có mưa: ${$(data).find('span#wob_pp').text()}\n` +
                    `Độ ẩm: ${$(data).find('span#wob_hm').text()} %\n`;
                dataCrawler.push({
                    type: 'weather',
                    data: weather,
                });
            }
            //Giá Bitcoin
            const bitcoin = $(data).find('span.pclqee').text();
            if (bitcoin != null && bitcoin !== '') {
                // console.log("5");
                const text: string = bitcoin + ' ' + $(data).find('span.dvZgKd').text();
                dataCrawler.push({
                    type: 'bitcoin',
                    data: text,
                });
            }
            //ngay le
            const dateFestival = $(data).find('div.zCubwf').text();
            if (dateFestival != null && dateFestival !== '') {
                // console.log("6");
                dataCrawler.push({
                    type: 'dateFestival',
                    data: dateFestival,
                });
            }
            //bong da
            const team1 = $(data).find('div.kno-fb-ctx > span').first().text();
            if (team1 != null && team1 !== '') {
                const score1 = $(data).find('div.imso_mh__l-tm-sc.imso_mh__scr-it.imso-light-font').last().text();
                const team2 = $(data).find('div.kno-fb-ctx > span').last().text();
                const score2 = $(data).find('div.imso_mh__r-tm-sc.imso_mh__scr-it.imso-light-font').last().text();
                const response = `${team1} ${score1} - ${score2} ${team2}`;
                dataCrawler.push({
                    type: 'football',
                    data: response,
                });
            }

            //Tiền tệ
            const money = $(data).find('span.DFlfde.SwHCTb').text();
            if (money != null && money !== '') {
                const dataMoney = $(data).find('span.MWvIVe').text();
                dataCrawler.push({
                    type: 'money',
                    data: money + ' ' + dataMoney,
                });
            }
            //chuyen doi
            const changeUnit = $(data).find('div.dDoNo.vrBOv.vk_bk').text();
            if (changeUnit != null && changeUnit !== '') {
                dataCrawler.push({
                    type: 'changeUnit',
                    data: changeUnit,
                });
            }
            // tinh toan
            const math = $(data).find('span.qv3Wpe').text();
            if (math != null && math !== '') {
                dataCrawler.push({
                    type: 'math',
                    data: math,
                });
            }
            //zipcode
            const zipcode = $(data).find('div.bVj5Zb.FozYP');
            if (zipcode.length > 0) {
                let msgZipCode: string;
                zipcode.each(function (e, i) {
                    if ($(this).text() != null && $(this).text() !== '') {
                        msgZipCode += $(this).text() + '\n';
                    }
                });
                msgZipCode = msgZipCode.replace(/undefined/g, '');
                dataCrawler.push({
                    type: 'zipcode',
                    data: msgZipCode,
                });
            }
            //Khoảng cách
            const far = $(data).find('div.LGOjhe').text();

            if (far != null && far !== '') {
                dataCrawler.push({
                    type: 'far',
                    data: far,
                });
            }
            //Ngày thành lập
            const dateCreate = $(data).find('div.Z0LcW').text();
            if (dateCreate != null && dateCreate !== '') {
                dataCrawler.push({
                    type: 'dateCreate',
                    data: dateCreate,
                });
            }
            //Thong tin
            const information = $(data).find('div.kno-rdesc > span').first().text();
            if (information != null && information !== '') {
                dataCrawler.push({
                    type: 'information',
                    data: information,
                });
            }
            //dịch
            const translate = $(data).find('div.oSioSc>div>div>div>pre>span').first().text();
            if (translate != null && translate !== '') {
                dataCrawler.push({
                    type: 'translate',
                    data: translate,
                });
            }
            //date
            const day = $(data).find('div.FzvWSb').text();
            if (day != null && day !== '') {
                dataCrawler.push({
                    type: 'day',
                    data: day,
                });
            }
            const time = $(data).find('div.YwPhnf').text();
            if (time != null && time !== '') {
                dataCrawler.push({
                    type: 'time',
                    data: time,
                });
            }
            // Lyrics
            const lyric = $(data).find('div.PZPZlf.zloOqf').first();
            if (lyric.length > 0) {
                const lyricData = [];
                lyric.each((i, data) => {
                    const lyrics = $(data).find('span');
                    lyrics.each((i, data) => {
                        lyricData.push($(data).text());
                    });
                });
                const lyricText = [];
                if (lyricData.length > 0) {
                    for (let i = 0; i < lyricData.length; i += 30) {
                        const lyric = lyricData.slice(i, i + 30).join('\n');
                        lyricText.push(lyric);
                    }
                }
                dataCrawler.push({
                    type: 'lyric',
                    data: lyricText,
                });
            }
            // remove duplicate data
            const dataFilter: string[] = [];
            dataCrawler.forEach((data) => {
                if (typeof data.data === 'string') {
                    if (!dataFilter.includes(data.data)) {
                        dataFilter.push(data.data);
                    } else {
                        dataCrawler.splice(dataCrawler.indexOf(data), 1);
                    }
                }
            });
            return dataCrawler;
        } catch (error) {
            console.log(error);
        }
    };

    public async getYoutube(message: string): Promise<CrawDataYoutube[]> {
        const dataCrawler: CrawDataYoutube[] = [];
        const videos = await yt.search(message.replace('@yt', ''));
        if (videos.length > 0 && videos.length >= 10) {
            for (let i = 0; i < 10; i++) {
                const video = videos[i];
                dataCrawler.push({
                    title: video.title,
                    url: video.url,
                    thumbnail: video.snippet.thumbnails.high.url,
                    duration: video.snippet.duration,
                    views: video.views,
                });
            }
        } else if (videos.length > 0 && videos.length < 10) {
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i];
                dataCrawler.push({
                    title: video.title,
                    url: video.url,
                    thumbnail: video.snippet.thumbnails.high.url,
                    duration: video.snippet.duration,
                    views: video.views,
                });
            }
        }
        return dataCrawler;
    }

    public stripAccent = (str: string): string => {
        try {
            if (str === null || str === undefined) return '';
            str = str.toLowerCase();
            str = str.replace(new RegExp('[àáạảãâầấậẩẫăằắặẳẵ]', 'g'), 'a');
            str = str.replace(new RegExp('[èéẹẻẽêềếệểễ]', 'g'), 'e');
            str = str.replace(new RegExp('[ìíịỉĩ]', 'g'), 'i');
            str = str.replace(new RegExp('[òóọỏõôồốộổỗơờớợởỡ]', 'g'), 'o');
            str = str.replace(new RegExp('[ùúụủũưừứựửữ]', 'g'), 'u');
            str = str.replace(new RegExp('[ỳýỵỷỹ]', 'g'), 'y');
            str = str.replace(new RegExp('đ', 'g'), 'd');
            str = str.replace(new RegExp('[^a-z0-9]', 'g'), ' ');
            str = str.replace(new RegExp(' +', 'g'), ' ');
            return str;
        } catch (error) {
            return;
        }
    };

    public getRanDomBetween(min: number, max: number): number {
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }
        return (Math.floor(Math.random() * 1000000000000000) % (max - min + 1)) + min;
    }

    public getLuckyNumber = (message: string): CrawDataLucky => {
        message = message.replace('@lucky', '');
        const dataLucky: CrawDataLucky = {
            data: [],
            title: '',
        };
        let min = 0;
        let max = 0;
        let get = 0;
        if (message.includes('min=')) {
            min = Number(message.split('min=')[1].split(' ')[0]);
        }
        if (message.includes('max=')) {
            max = Number(message.split('max=')[1].split(' ')[0]);
        }
        if (message.includes('get=')) {
            get = Number(message.split('get=')[1].split(' ')[0]);
        }
        const arrayLucky = [];
        if (min && max && get) {
            if (get < 0) {
                get = 1;
            }
            if (min > max) {
                const temp = min;
                min = max;
                max = temp;
            }
            for (let i = 0; i < get; i++) {
                const lucky = this.getRanDomBetween(min, max);
                arrayLucky.push(lucky);
            }
            dataLucky.title = `Số may mắn của bạn là: ${arrayLucky.join(', ')}`;
            dataLucky.data = arrayLucky.join(', ');
            dataLucky.data = arrayLucky.join(', ');
            return dataLucky;
        } else if (min && max && !get) {
            if (min > max) {
                const temp = min;
                min = max;
                max = temp;
            }
            const lucky = this.getRanDomBetween(min, max);
            dataLucky.title = `Số may mắn của bạn là: ${lucky}`;
            dataLucky.data = [String(lucky)];
            dataLucky.message = 'success';
            return dataLucky;
        } else {
            // random tu 1 den 100
            const lucky = this.getRanDomBetween(1, 100);
            dataLucky.data = [String(lucky)];
            dataLucky.message =
                'Nếu muốn lấy số may mắn từ 1 đến 100 thì hãy gõ @lucky min=1 max=100 \nNếu muốn lấy nhiều số may mắn từ 1 đến 100 thì hãy gõ @lucky min=1 max=100 get=5';
            return dataLucky;
        }
    };

    public crawlerXSMB = async (): Promise<string> => {
        try {
            const url = `https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss`;

            //set cookie to axios
            const { data } = await this.httpService.get(url).toPromise();
            const $ = cheerio.load(data);
            const result = [];
            $('item').each(function (i, e) {
                const title: string = $(this).find('title').text();
                const description: string = $(this).find('description').text();
                result.push({
                    title: title,
                    description: description,
                });
            });
            const dataResult = result[0].description.replace('\n', '').split('\n');
            const giaiDB = 'Giải ĐB: ' + dataResult[0].replace('ĐB: ', '');
            const giaiNhat = 'Giải Nhất: ' + dataResult[1].replace('1: ', '');
            const giaiNhi = 'Giải Nhì: ' + dataResult[2].replace('2: ', '');
            const giaiBa = 'Giải Ba: ' + dataResult[3].replace('3: ', '');
            const giaiTu = 'Giải Tư: ' + dataResult[4].replace('4: ', '');
            const giaiNam = 'Giải Năm: ' + dataResult[5].replace('5: ', '');
            const giaiSau = 'Giải Sáu: ' + dataResult[6].replace('6: ', '');
            const giaiBay = 'Giải Bảy: ' + dataResult[7].replace('7: ', '');
            return `${giaiDB}\n${giaiNhat}\n${giaiNhi}\n${giaiBa}\n${giaiTu}\n${giaiNam}\n${giaiSau}\n${giaiBay}`;
        } catch (error) {
            return 'Lỗi';
        }
    };
}
