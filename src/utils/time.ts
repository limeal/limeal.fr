import moment from "moment";

const getCurrentTimeInLetter = (time: string) => {
    const date = moment(time, 'YYYY-MM-DD');

    return date.format("DD") + " " + date.format("MMMM") + " " + date.format("YYYY");
};

const getCurrentTimeInFormat = (time: string) => {
    const [day, month, year] = time.split(" ");

    return moment(`${day} ${month} ${year}`, 'DD MMMM YYYY').format("YYYY-MM-DD");
};


export { getCurrentTimeInLetter, getCurrentTimeInFormat };