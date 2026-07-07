import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { Readable } from "stream";
import ffmpeg from "fluent-ffmpeg";

export const POST = async ({ request, cookies }): Promise<Response> => {
  let tokenCookie = cookies.get("token-0") || null;
  if (!tokenCookie)
    return json(apiResponse(null, null, 403, false, "Invalid Token"));

  const form = await request.formData();
  const file = form.get("file") as File;

  if (!file)
    return json(apiResponse(null, null, 401, false, "Invalid File Provided"));

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileDir = join(process.cwd(), "static", "audio");

  if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true });

  const alertId = randomUUID();

  const filename = `soundalert_${alertId}.mp3`;
  const filePath = join(fileDir, filename);

  return new Promise((resolve) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    ffmpeg(stream)
      .toFormat("mp3")
      .audioBitrate(128)
      .on("end", () => {
        resolve(json(apiResponse({ url: `/audio/${filename}` })));
      })
      .on("error", () => {
        resolve(
          json(
            apiResponse(
              null,
              null,
              401,
              false,
              "Failed to remux audio file to MP3",
            ),
          ),
        );
      })
      .save(filePath);
  });
};
