import dotenv from 'dotenv';
dotenv.config();
// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'DB_PASSWORD'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
const config = {
    // Discord Configuration
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
    },
    // Database Configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'paimom',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    // Bot Settings
    bot: {
        prefix: process.env.PREFIX || '/',
        logLevel: process.env.LOG_LEVEL || 'info',
        timezone: process.env.TIMEZONE || 'UTC',
    },
    // Genshin Server Reset Times
    // All servers reset at 04:00 local server time
    // UTC times are computed at runtime to handle DST changes
    genshinServers: {
        asia: {
            name: 'Asia',
            timezone: 'Asia/Shanghai',
            dailyResetTime: '04:00', // Local time (no DST in China)
            weeklyResetDay: 1, // ISO weekday: 1 = Monday
            weeklyResetTime: '04:00',
        },
        na: {
            name: 'America',
            timezone: 'America/New_York',
            dailyResetTime: '04:00', // Local time (handles EST/EDT automatically)
            weeklyResetDay: 1, // ISO weekday: 1 = Monday
            weeklyResetTime: '04:00',
        },
        eu: {
            name: 'Europe',
            timezone: 'Europe/Berlin',
            dailyResetTime: '04:00', // Local time (handles CET/CEST automatically)
            weeklyResetDay: 1, // ISO weekday: 1 = Monday
            weeklyResetTime: '04:00',
        },
        tw: {
            name: 'TW/HK/MO (SAR)',
            timezone: 'Asia/Taipei',
            dailyResetTime: '04:00', // Local time (no DST in Taiwan)
            weeklyResetDay: 1, // ISO weekday: 1 = Monday
            weeklyResetTime: '04:00',
        },
    },
    // Notification Settings
    notifications: {
        enabled: process.env.ENABLE_NOTIFICATIONS === 'true',
        checkInterval: parseInt(process.env.NOTIFICATION_CHECK_INTERVAL || '60000', 10),
        reminderMinutes: [30, 15, 5, 0], // Minutes before reset
    },
    // Rate Limiting
    rateLimit: {
        window: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
    },
    // Embed Colors
    colors: {
        primary: 0x5865F2,
        success: 0x57F287,
        warning: 0xFEE75C,
        error: 0xED4245,
        pyro: 0xFF6B6B,
        hydro: 0x4ECDC4,
        anemo: 0x74B9FF,
        electro: 0xA29BFE,
        dendro: 0x6BCF7F,
        cryo: 0x74C0FC,
        geo: 0xFAB005,
    },
    // Resin Settings
    resin: {
        max: 200,
        regenRate: 8, // minutes per resin
    },
};
export default config;
//# sourceMappingURL=config.js.map