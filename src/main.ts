import axios from "axios";

import { Date2RFC3339Format } from "./modules/data";
import { postText } from "./modules/slack";
import { getKeys } from "./modules/token";

const argv = require("minimist")(process.argv.slice(2));

const main = async () => {
  if (argv["_"].length === 0) {
    return;
  }

  const date_hour = argv["_"][0] as number;
  let duration = 0;

  switch (date_hour) {
    case 8:
      await postText("<@ryokohbato> 朝のニュースです", "#jp-media-news");
      duration = 8;
      break;
    case 12:
      await postText("<@ryokohbato> お昼のニュースです", "#jp-media-news");
      duration = 4;
      break;
    case 16:
      await postText("<@ryokohbato> 夕方のニュースです", "#jp-media-news");
      duration = 4;
      break;
    case 20:
      await postText("<@ryokohbato> 夜のニュースです", "#jp-media-news");
      duration = 4;
      break;
    case 24:
      await postText("<@ryokohbato> 深夜のニュースです", "#jp-media-news");
      duration = 4;
      break;
    default:
      return;
  }

  // TODO: このあたり、かなり雑なのでなんとかする
  const now = new Date();
  const publishedLimitTime = new Date(now.getTime() - duration * 60 * 60 * 1000);

  let items: any[] = [];
  const channels: any[] = [
    // 並び順に意味はない
    "UCuTAXTexrhetbOe3zgskJBQ", // 日テレNEWS
    "UCGCZAYq5Xxojl_tSXcVJhiQ", // ANNnewsCH
    "UC6AG81pAkf6Lbi_1VC5NmPA", // TBS NEWS
    "UCoQBJMzcwmXrRSHBFAlTsIw", // FNNプライムオンライン
    "UCv7_krlrre3GQi79d4guxHQ", // 読売テレビニュース
    "UCkKJhKO73xF1pK5h9R82ZGQ", // MBS NEWS
    "UCkKVQ_GNjd8FbAuT6xDcWgg", // テレ東BIZ
    "UC1zYGo1jIIjMVDTLL3dydow", // SankeiNews
    "UCd6GEK664CTEWRZda7Fu7Lg", // テレビ大阪ニュース
    // TODO: 朝日新聞社のチャンネルIDが分からん
  ];

  let result: any = null;

  for (const key in channels) {
    let pageToken = "";

    // 次のページがない場合はレスポンスに入っていない
    while (pageToken != null) {
      try {
        result = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${
            channels[key]
          }&order=date&key=${(await getKeys()).youtube}&publishedAfter=${Date2RFC3339Format(
            publishedLimitTime
          )}&maxResults=50&pageToken=${pageToken}`
        );

        pageToken = result.data.nextPageToken;
        // 次のページがない場合は undefined になるのでループを抜ける

        items = [...items, ...result.data.items];
      } catch (error: any) {
        // 気付ければどうでもいいのでこの辺は適当
        await postText(
          `<@ryokohbato>\njp-media-news: 情報の取得に失敗しました。\n${JSON.stringify(
            error?.response?.data
          )}`,
          "#ryokohbato-dev-log-zatsu"
        );
        return;
      }
    }
  }

  if (result === null) {
    return;
  }

  await Promise.all(
    // 1秒間隔でSlackに投げる
    (items as any[]).map((item, index) => {
      new Promise((resolve) =>
        setTimeout(async () => {
          await postText(
            `${item.snippet.title}\nhttps://www.youtube.com/watch?v=${item.id.videoId}`,
            "#jp-media-news"
          );
          resolve;
        }, index * 1000)
      );
    })
  );
};

main();
