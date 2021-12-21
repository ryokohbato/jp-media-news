// この形式が必要らしい
// https://developers.google.com/youtube/v3/docs/search/list?hl=ja
export const Date2RFC3339Format = (date: Date): string => {
  // 時差の処理
  const date_GMT: Date = new Date(date.getTime() - 9 * 60 * 60 * 1000);
  return `${date_GMT.getFullYear()}-${
    date_GMT.getMonth() + 1
  }-${date_GMT.getDate()}T${date_GMT.getHours()}:${date_GMT.getMinutes()}:${date_GMT.getSeconds()}Z`;
};
