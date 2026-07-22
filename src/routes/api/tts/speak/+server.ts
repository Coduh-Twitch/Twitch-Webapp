import {
  PRIVATE_SE_JWT,
  PRIVATE_SE_OT,
  PRIVATE_TTS_URL,
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
    finalContent = `${sentByUsername} cheered, x ${toWords(bits.toString())}: ${content}`;
  } else if (streak && streak > 0) {
    finalContent = `${sentByUsername} has watched ${toWords(streak.toString())} stream${streak === 1 ? "" : "s"} in a row! \"${content}\"`;
  } else {
    finalContent = `${sentByUsername} said ${content}`;
  }

  try {
    const res = await fetch(
      `${PRIVATE_TTS_URL}&text=${encodeURIComponent(finalContent)}&key=${PRIVATE_SE_OT}`,
      {
        headers: {
          Authorization: `Bearer ${PRIVATE_SE_JWT}`,
        },
      },
    );
    if (!res.ok) return new Response(null);

    console.log("RES", res);

    const buffer = await res.arrayBuffer();

    return new Response(buffer);
  } catch (e) {
    console.log(e);
    return new Response(null);
  }
};
