import moment from "moment";

const getCurrentTimeInLetter = (time: string) => {
    const date = moment(time, 'YYYY-MM-DD');

    return date.format("MMMM") + " - " + date.format("YYYY");
};


export { getCurrentTimeInLetter };