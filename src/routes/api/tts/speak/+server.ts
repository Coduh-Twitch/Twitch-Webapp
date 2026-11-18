import {
  PRIVATE_CHATBOT_APP_URL,
  PRIVATE_SE_JWT,
  PRIVATE_SE_OT,
  PRIVATE_TTS_URL,
  PRIVATE_TWITCH_CLIENT_SECRET,
} from "$env/static/private";
import type { TTSQueueItem } from "$lib/types.js";
import { toWords } from "$lib/util";
import { tmpdir } from "os";
import { join } from "path";

function utterancePath(queueItem: TTSQueueItem): string {
  let toReturn = join(
    tmpdir(),
    `tts_${queueItem.sentById}_${queueItem.sentAt}.webm`,
  );
  return toReturn;
}

const mode: "se" | "polly" = "se";

export const POST = async ({
  request,
  fetch,
  setHeaders,
}): Promise<Response> => {
  const utterance: TTSQueueItem = await request.json();
  utterancePath(utterance);
  const {
    bits,
    content,
    isTos,
    sentAt,
    sentById,
    sentByUsername,
    voice,
    streak,
  } = utterance;
  if (!content || !sentAt || !sentById || !sentByUsername || !voice)
    return new Response(null);

  let finalContent = content;

  if (bits && bits > 0) {
    finalContent = `${sentByUsername} cheered: x ${toWords(bits.toString())}. ${content}`;
  } else if (streak && streak > 0) {
    finalContent = `${sentByUsername} has watched ${toWords(streak.toString())} stream${streak === 1 ? "" : "s"} in a row! \"${content}\"`;
  } else {
    finalContent = `${sentByUsername} said. ${content}`;
  }

  const emojiRegex = /\p{RI}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}(?:\uFE0F|\p{EMod})?[\u{E0020}-\u{E007F}]*(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{EMod})?)*|\p{RI}/gu;

  let emojis = 0;
  finalContent = finalContent.replace(emojiRegex, (match) => (++emojis <= 5) ? match : "");
  if(finalContent.length >= 250) finalContent = finalContent.slice(0, 200);

  try {
    let res;

    if (mode as string === "se") {
      res = await fetch(
        `${PRIVATE_TTS_URL}&text=${encodeURIComponent(finalContent)}&key=${PRIVATE_SE_OT}`,
        {
          headers: {
            Authorization: `Bearer ${PRIVATE_SE_JWT}`,
          },
        },
      );
    } else if (mode as string === "polly") {
      res = await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/speech?voice=f`, {
        headers: {
          "Authorization": PRIVATE_TWITCH_CLIENT_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({content: finalContent}),
        method: "POST",

      })
    }
    if (!res || !res?.ok) return new Response(null);

    console.log("RES", res);

    const buffer = await res.arrayBuffer();

    return new Response(buffer);
  } catch (e) {
    console.log(e);
    return new Response(null);
  }
};
