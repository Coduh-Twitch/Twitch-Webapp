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
  show_label: boolean;
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
  duration_seconds: number;
  portrait_download_url: string | null;
  download_url: string;
  creator_profile_image: string;
}

export interface DBClipVisibility {
  channel: string;
  visible: boolean;
}

export interface DBBadge {
  id: string;
  channel_id?: string;
  badge_id: string;
  set_id: string;
  url: string;
}

export enum TTSVoices {
  CHRISTOPHER = "en-US-ChristopherNeural",
  ARIA = "en-US-AriaNeural",
}

export interface TTSQueueItem {
  id: string;
  content: string;
  voice: TTSVoices;
  sentById: string;
  sentByUsername: string;
  sentAt: number;
  bits: number;
  isTos: boolean;
}

// Twitch API Types

export enum TwitchBroadcasterTypes {
  AFFILIATE = "affiliate",
  PARTNER = "partner",
  DEFAULT = "",
}

export enum TwitchUserTypes {
  ADMIN = "admin",
  GLOBAL_MOD = "global_mod",
  STAFF = "staff",
  DEFAULT = "",
}

export interface TwitchPaginatedResponse<T> {
  total: number;
  data: T[];
  pagination: {
    cursor: string;
  };
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

export interface TwitchGlobalBadge {
  id: string;
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  title: string;
  description: string;
  click_action: string;
  click_url: string;
}

export interface TwitchGlobalBadgeSet {
  set_id: string;
  versions: TwitchGlobalBadge[];
}

export enum SevenTVPlatform {
  TWITCH = "TWITCH",
  DISCORD = "DISCORD",
}

export interface SevenTVEmoteHost {
  name: string;
  static_name: string;
  width: number;
  height: number;
  frame_count: number;
  size: number;
  format: string;
}

export interface SevenTVConnection {
  id: string;
  platform: SevenTVPlatform;
  username: string;
  display_name: string;
  linked_at: number;
  emote_capacity: number;
  emote_set_id: string;
}
export interface SevenTVUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  style: {
    paint_id: string;
  };
  role_ids: string[];
  connections: SevenTVConnection[];
}

export interface SevenTVEmote {
  id: string;
  name: string;
  flags: number;
  timestamp: number;
  actor_id: string;
  data: {
    id: string;
    name: string;
    flags: number;
    lifecycle: number;
    state: string[];
    listed: boolean;
    animated: boolean;
    owner: SevenTVUser;
    host: {
      url: string;
      files: SevenTVEmoteHost[];
    };
  };
  origin_id: string | null;
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
  DEFAULT = "Viewer",
  VIP = "VIP",
  MOD = "Moderator",
  LEAD_MOD = "Lead Moderator",
  BROADCASTER = "Broadcaster",
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

// Packets
export interface Packets {
  heartbeat: {};
  ok: {};
  nope: {};
  check: {};
  isActive: { active: boolean };
  chat: ChatPacket;
  chatclear: {};
}

export type Packet<T = keyof Packets> = {
  command: keyof Packets | T;
  data: any;
  id: number;
};

export enum ChatPacketSource {
  TIKTOK,
  TWITCH,
  DISCORD,
}

export interface ChatPacket {
  source: ChatPacketSource;
  content: string;
  date: Date;
  messageId: string;
  channelId: string;
  emoteOffsets: Record<string, string>;

  twitchData?: {
    isHighlighted: boolean;
    isFirst: boolean;
    isCheer: boolean;
    isRedemption: boolean;
    isHypeChat: boolean;
    isReply: boolean;
    isReturningChatter: boolean;

    bits: number;

    hypeChatAmount?: number | null;
    hypeChatCurrency?: string | null;
    hypeChatIsSystemMessage?: boolean | null;
    hypeChatLevel?: number | null;
    hypeChatLocalizedAmount?: number | null;

    parentMessageId?: string | null;
    parentMessageText?: string | null;
    parentMessageUserDisplayName?: string | null;
    parentMessageUserId?: string | null;
    parentMessageUserName?: string | null;

    rewardId?: string | null;
    threadMessageId?: string | null;
    threadMessageUserId: string | null;
  };

  userInfo: {
    display_name: string;
    login: string;
    isMod: boolean;
    userId: string;
    color: string | null;

    twitchData?: {
      type: "mod" | "global_mod" | "admin" | "staff" | "default";
      badgeInfo: Record<string, string>;
      badges: Record<string, string>;

      isArtist: boolean;
      isLeadMod: boolean;
      isBroadcaster: boolean;
      isFounder: boolean;
      isSubscriber: boolean;
      isVip: boolean;
    };
  };
}
