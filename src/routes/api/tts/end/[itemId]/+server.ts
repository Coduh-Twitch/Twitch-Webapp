import { PRIVATE_CHATBOT_APP_URL } from "$env/static/private";
import type { TTSQueueItem } from "$lib/types.js";
import { json } from "@sveltejs/kit";
import { createReadableStream } from "@sveltejs/kit/node";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  ReadStream,
  statSync,
  unlinkSync,
} from "fs";
import { EdgeTTS } from "node-edge-tts";
import { tmpdir } from "os";
import { join } from "path";
import { Readable } from "stream";

function utterancePath(queueItem: TTSQueueItem): string {
  let toReturn = join(
    tmpdir(),
    `tts_${queueItem.sentById}_${queueItem.sentAt}.webm`,
  );
  console.log("PATH", toReturn);
  return toReturn;
}

export const POST = async ({ request, fetch, params }): Promise<Response> => {
  let res = await (
    await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/tts/end/${params.itemId}`)
  ).json();

  return json(res);
};
