export interface DiscordConfig {
    token: string;
    clientId: string;
    guildId: string;
}
export interface DatabasePoolConfig {
    max: number;
    min: number;
    acquire: number;
    idle: number;
}
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: 'postgres';
    logging: boolean | ((sql: string) => void);
    pool: DatabasePoolConfig;
}
export interface BotConfig {
    prefix: string;
    logLevel: string;
    timezone: string;
}
export interface GenshinServer {
    name: string;
    timezone: string;
    dailyResetTime: string;
    weeklyResetDay: number;
    weeklyResetTime: string;
}
export interface GenshinServersConfig {
    asia: GenshinServer;
    na: GenshinServer;
    eu: GenshinServer;
    tw: GenshinServer;
}
export interface NotificationsConfig {
    enabled: boolean;
    checkInterval: number;
    reminderMinutes: number[];
}
export interface RateLimitConfig {
    window: number;
    maxRequests: number;
}
export interface ColorsConfig {
    primary: number;
    success: number;
    warning: number;
    error: number;
    pyro: number;
    hydro: number;
    anemo: number;
    electro: number;
    dendro: number;
    cryo: number;
    geo: number;
}
export interface ResinConfig {
    max: number;
    regenRate: number;
}
export interface Config {
    discord: DiscordConfig;
    database: DatabaseConfig;
    bot: BotConfig;
    genshinServers: GenshinServersConfig;
    notifications: NotificationsConfig;
    rateLimit: RateLimitConfig;
    colors: ColorsConfig;
    resin: ResinConfig;
}
declare const config: Config;
export default config;
//# sourceMappingURL=config.d.ts.map