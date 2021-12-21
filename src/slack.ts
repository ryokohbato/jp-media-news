import axios from "axios";

import { getKeys } from "./token";

// 指定したメッセージを指定したチャンネルに投げるだけ
export const postText = async (message: string, channel: string) => {
  try {
    const result = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        text: message,
      },
      {
        headers: {
          Authorization: `Bearer ${(await getKeys()).slack}`,
          "Content-Type": "application/json",
        },
      }
    );
    return result.data;
  } catch (error) {
    console.log(error);
    return;
  }
};
