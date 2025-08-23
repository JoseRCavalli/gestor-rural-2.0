export const toLocateDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() - 3);
    return date;
}