import { PRIVATE_CHATBOT_APP_URL } from '$env/static/private'
import type { ChatCommand } from '$lib/types';
import { apiResponse } from '$lib/util.js';
import { json } from '@sveltejs/kit';

export const GET = async ({fetch}): Promise<Response> => {
    try {
        let res: {commands: ChatCommand[]} = await (await fetch(`${PRIVATE_CHATBOT_APP_URL}/api/commands`)).json();
        if(!res.commands) return json(apiResponse<ChatCommand[]>([]));
        return json(apiResponse<ChatCommand[]>(res.commands));
    } catch (e) {
        return json(apiResponse([]))
    }
}