import { PRIVATE_CHATBOT_APP_URL, PRIVATE_TWITCH_CLIENT_SECRET } from '$env/static/private'
import { type DBCounter } from '$lib/types';
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const POST = async ({fetch, params}) => {
  const counter = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/counters/${params.counterId}/delete`, {method: "POST", headers: {"key": PRIVATE_TWITCH_CLIENT_SECRET}})).json();

  return json(apiResponse<DBCounter>(counter))
}
