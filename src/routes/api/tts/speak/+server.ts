import type { TTSQueueItem } from "$lib/types.js";
import { toWords } from "$lib/util";
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

export const POST = async ({
  request,
  fetch,
  setHeaders,
}): Promise<Response> => {
  const utterance: TTSQueueItem = await request.json();
  console.log(utterance);
  utterancePath(utterance);
  const { bits, content, isTos, sentAt, sentById, sentByUsername, voice } =
    utterance;
  if (!content || !sentAt || !sentById || !sentByUsername || !voice)
    return new Response(null);

  const tts = new EdgeTTS({
    voice,
    lang: "en-US",
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
  });

  let finalContent = content;

  if (bits && bits > 0) {
    finalContent = `${sentByUsername} cheered, x ${toWords(bits.toString())}: ${content}`;
  } else finalContent = `${sentByUsername} said ${content}`;

  // let stream: ReadStream | null = createReadStream(utterancePath(utterance));
  await tts.ttsPromise(finalContent, utterancePath(utterance)).catch((e) => {
    console.log(e);
    if (existsSync(utterancePath(utterance)))
      unlinkSync(utterancePath(utterance));

    return new Response(null);
  });
  console.log("creating file at ", utterancePath(utterance));
  if (!existsSync(utterancePath(utterance))) return new Response(null);

  let buffer = readFileSync(utterancePath(utterance));
  // let blob = new Blob([buffer], { type: "audio/mpeg" });

  // const headers = new Headers();
  // headers.set("Content-Type", "audio/mpeg");
  // headers.set("Content-Length", stats.size.toString());

  return new Response(buffer);
};
