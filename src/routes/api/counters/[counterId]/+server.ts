import { PRIVATE_CHATBOT_APP_URL } from '$env/static/private'
import { type DBCounter } from '$lib/types';
import { apiResponse } from '$lib/util';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch, params}) => {
  const counter = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/counters/${params.counterId}`)).json();

  return json(apiResponse<DBCounter>(counter))
}
