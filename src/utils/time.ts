import moment from "moment";

import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/ko';

const getCurrentTimeInLetter = (time: string, lang?: string) => {
    if (lang === "kr") lang = "ko";
    const date = moment(time, 'YYYY-MM-DD');

    date.locale(lang ?? "fr");
    const month = date.format("MMMM");

    return date.format("DD") + " " + (month[0].toUpperCase() + month.slice(1)) +  " " + date.format("YYYY");
};


export { getCurrentTimeInLetter };