import { getGuessedWords } from "$lib/server/db/appConfig";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async () => {
  const words = getGuessedWords();

  return json(apiResponse(words));
};
