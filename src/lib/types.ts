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

export enum SlopMode {
  NONE,
  SUBWAY_SURFERS,
  SOAP,
  CUSTOM,
}

export interface DBAppConfig {
  id?: string;
  custom_video_id: string;
  death_count: number;
  stuck_count: number;
  reward_tts_enabled: boolean;
  cheer_tts_enabled: boolean;
  command_tts_emabled: boolean;
  show_stuck_count: boolean;
  show_death_count: boolean;
  slop_mode: SlopMode;
}

export interface DBLeaderboardMember {
  _id: string;
  twitchId: string;
  avatar_url: string;
  username: string;
  points: number;
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

export interface DBSoundAlertQueueItem {
  id: string;
  reward_id: string;
  alert_name: string;
  audio_path: string;
  sent_at: number;
  sent_by_id: string;
  sent_by_username: string;
}

export interface DBAmazonProduct {
  asin: string;
  title: string;
  price: number;
  price_symbol: string;
  url: string;
  image_url: string;
  added_at: number;
  added_by_id: string;
  added_by_username: string;
  categories: string[];
}

export enum DBQueueRoles {
  MOD,
  VIP,
  SUBSCRIBER,
  DEFAULT,
}

export interface DBQueueMember {
  primaryId: string;
  id: string;
  queueId: string;
  role: DBQueueRoles;
  avatar_url: string;
  username: string;
  position: number;
  joined_at: number;
  bumped: boolean;
}

export interface DBGameQueue {
  id: string;
  game: string;
  createdByUserId: string;
  maximumRosterSize: number;
  membersPerRound: number;
  members: DBQueueMember[];
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
  streak: number;
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

export interface TwitchCustomReward {
  broadcaster_name: string;
  broadcaster_id: string;
  id: string;
  image: string | null;
  background_color: string;
  is_enabled: boolean;
  cost: number;
  title: string;
  prompt: string;
  is_user_input_required: boolean;
  max_per_stream_setting: {
    is_enabled: boolean;
    max_per_stream: number;
  };
  max_per_user_per_stream_setting: {
    is_enabled: boolean;
    max_per_user_per_stream: number;
  };
  global_cooldown_setting: {
    is_enabled: boolean;
    global_cooldown_seconds: number;
  };
  is_paused: boolean;
  is_in_stock: boolean;
  default_image: {
    url_1x: string;
    url_2x: string;
    url_4x: string;
  };
  should_redemptions_skip_request_queue: boolean;
  redemptions_redeemed_current_stream: number | null;
  cooldown_expires_at: number | null;
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
  deleteMessage: { id: string };
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
