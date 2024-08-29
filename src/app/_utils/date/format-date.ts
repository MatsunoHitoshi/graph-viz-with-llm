import dayjs from "dayjs";

export const formatDate = (datetime: Date | string ) => {
    const date = dayjs(datetime)
    const ymdt = date.format("YYYY/MM/DD HH:mm");
    return ymdt;
}