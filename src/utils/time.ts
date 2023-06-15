import * as moment from 'moment-timezone';
export type TimeCurrent = {
    date: string;
    hour: number;
    minute: number;
    second: number;
    day: number;
    month: number;
    year: number;
    dateTime: string;
};

export const getTimeCurrent = (timezone: string): TimeCurrent => {
    const date = moment().tz(timezone);
    return {
        date: date.format('YYYY-MM-DD'),
        hour: date.hour(),
        minute: date.minute(),
        second: date.second(),
        day: date.date(),
        month: date.month() + 1,
        year: date.year(),
        dateTime: date.format('HH:mm:ss DD/MM/YYYY'),
    };
};
