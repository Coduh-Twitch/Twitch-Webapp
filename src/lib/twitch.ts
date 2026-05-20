import { PUBLIC_TWITCH_CLIENT_ID, PUBLIC_TWITCH_HELIX_BASE_URL } from "$env/static/public";
import axios, { type AxiosResponse } from "axios";
import type {TwitchArrayResponse, TwitchModeratedChannel, TwitchPaginatedResponse, TwitchUser, TwitchUserQueryResponse } from "./types";
import { UserRoles, type Auth } from "duckylib";
import { createDatabaseUser, getDatabaseUser } from "./server/db/users";

enum Endpoints {
    CURRENT_USER="/users",
    USERS="/users",
    FOLLOWED_CHANNELS="/channels/followed",
    GLOBAL_BADGES="/chat/badges/global",
    CHANNEL_BADGES="/chat/badges",
    MODERATED_CHANNELS="/moderation/channels",
    CHANNELS="/channels"
}

let baseUrl = PUBLIC_TWITCH_HELIX_BASE_URL;


function headers(token: string | null): Record<string, string> {
    let head = {
        "Authorization": `Bearer ${token}`,
        "Client-Id": PUBLIC_TWITCH_CLIENT_ID
    }

    return head;
}

async function get<T = unknown>(endpoint: Endpoints, token: string | null, queryString: string = ""): Promise<AxiosResponse<T> | null> {
    if(!token) return null;
    try {
        const res = await axios.get<T>(`${baseUrl}${endpoint}${queryString}`, {headers: headers(token)});
        if(res.status !== 200) return null;
        return res;
    } catch (e) {
        console.log("TWITCH GET FAILED", e)
        return null;
    }
}

async function post<T = unknown>(endpoint: Endpoints, token: string | null, body: any = {}, queryString: string = ""): Promise<AxiosResponse<T> | null> {
    if(!token) return null;
    try {
        const res = await axios.post<T>(`${baseUrl}${endpoint}${queryString}`, body, {headers: headers(token)})
        if(res.status !== 200) return null;

        return res;
    } catch(e) {
        console.log("TWITCH POST FAILED", e)
        return null;
    }
}

export async function getUserFromToken(token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.CURRENT_USER, token);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    return res.data.data[0];
}

export async function getUserByLogin(login: string, token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.USERS, token, `?login=${login}`);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    
    return res.data.data[0];
}

export async function getUserById(id: string, token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.USERS, token, `?id=${id}`);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    
    return res.data.data[0];
}

export async function getModeratedChannels(userId: string, token: string | null): Promise<TwitchModeratedChannel[]> {
    const res = await get<TwitchPaginatedResponse<TwitchModeratedChannel>>(Endpoints.MODERATED_CHANNELS, token, `?user_id=${userId}`);
    if(!res) return [];
    return res.data?.data || [];
}
