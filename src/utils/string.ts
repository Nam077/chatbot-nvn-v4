import { UserInformation } from '../modules/messenger/models/bot-messenger';
import { TimeCurrent } from './time';

export const validateMessage = (message: string, userProfile: UserInformation, date: TimeCurrent): string => {
    const { firstName, lastName, name, profilePic } = userProfile;
    const { hour, minute, second, day, month, year, dateTime } = date;

    return message
        .replaceAll('{{firstName}}', firstName)
        .replaceAll('{{lastName}}', lastName)
        .replaceAll('{{name}}', name)
        .replaceAll('{{profilePic}}', profilePic)
        .replaceAll('{{hour}}', hour.toString())
        .replaceAll('{{minute}}', minute.toString())
        .replaceAll('{{second}}', second.toString())
        .replaceAll('{{day}}', day.toString())
        .replaceAll('{{month}}', month.toString())
        .replaceAll('{{year}}', year.toString())
        .replaceAll('{{dateTime}}', dateTime);
};
