import { UserInformation } from '../modules/messenger/models/bot-messenger';
import { getTimeCurrent, TimeCurrent } from './time';
import slugify from 'slugify';

export const validateMessage = (
    message: string,
    userProfile: UserInformation,
    date: TimeCurrent = getTimeCurrent(),
): string => {
    const { firstName, lastName, name, profilePic } = userProfile;
    const { hour, minute, second, day, month, year, dateTime } = date;

    return message
        .replaceAll('{{first_name}}', firstName)
        .replaceAll('{{last_name}}', lastName)
        .replaceAll('{{name}}', name)
        .replaceAll('{{profile_pic}}', profilePic)
        .replaceAll('{{hour}}', hour.toString())
        .replaceAll('{{minute}}', minute.toString())
        .replaceAll('{{second}}', second.toString())
        .replaceAll('{{day}}', day.toString())
        .replaceAll('{{month}}', month.toString())
        .replaceAll('{{year}}', year.toString())
        .replaceAll('{{date_time}}', dateTime);
};

export const removeAllSpecialCharacters = (str: string): string => {
    return str.replace(/[^\p{L}\d\s]/gu, '').trim();
};
export const removeExtraSpaces = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
};

export const slugifyString = (str: string): string => {
    return slugify(str.trim(), {
        lower: true,
        strict: true,
        replacement: '-',
    });
};
export const chunkArray = <T>(arr: T[], chunk = 10): T[][] => {
    const result = [];
    for (let i = 0, j = arr.length; i < j; i += chunk) {
        result.push(arr.slice(i, i + chunk));
    }
    return result;
};
