// App API Types

export interface ApiError {
    message: string;
}

export interface ApiResponse<T = any> {
    v: number;
    for?: string;

    data: T;
    error?: ApiError;
    status?: number;
}



export interface DBAppConfig {
    id: string;
}

export interface DBSession {
    id?: string;
    user_id: string;
    access_token: string;
    refresh_token: string | null;
    expires_at: number;
}

export interface DBTimer {
	id: string;
	seconds: number;
	started_at: Date;
	visible: boolean;
	paused: boolean;
	label: string;
}

export interface DBNotice {
	id: string;
	visible: boolean;
	label: string;
}

export interface DBClip {
    id: string;
    title: string;
    game: string;
    gameId: string;
    createdDate: Date;
    featured: boolean;
    creatorName: string;
    creatorId: string;
    embedUrl: string;
    views: number;
    channel: string;
}

export interface DBClipVisibility {
    channel: string;
    visible: boolean;
}

// Twitch API Types

export enum TwitchBroadcasterTypes {
    AFFILIATE = "affiliate",
    PARTNER = "partner",
    DEFAULT = ""
}

export enum TwitchUserTypes {
    ADMIN = "admin",
    GLOBAL_MOD = "global_mod",
    STAFF = "staff",
    DEFAULT = ""
}

export interface TwitchPaginatedResponse<T> {
    total: number;
    data: T[];
    pagination: {
        cursor: string;
    }
}

export interface TwitchArrayResponse<T> {
    data: T[];
}

export interface TwitchUserQueryResponse {
    data: TwitchUser[];
}

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: TwitchBroadcasterTypes;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    created_at: string;
    view_count?: number;
}

export interface TwitchModeratedChannel {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
}

// Chatbot Types
export interface ChatCommandHelpArgument {
    name: string;
    description: string;
    required: boolean;
}

export interface ChatSubCommand {
    name: string;
    args: ChatCommandHelpArgument[];
    help: string;
    userLevel: UserRoles;
}

export enum UserRoles {
    DEFAULT="Viewer",
    VIP="VIP",
    MOD="Moderator",
    BOT="Bot",
    BROADCASTER="Broadcaster"
}

export interface ChatCommand {
    enabled: boolean;
    name: string;
    help: string;
    userLevel: UserRoles;
    aliases?: string[];
    subCommands?: ChatSubCommand[];
    args?: ChatCommandHelpArgument[]; 
}

export interface CustomCommand {
    id: string; // UUID
    trigger: string; // !something
    content: string; // response content
    userLevel: UserRoles;
}