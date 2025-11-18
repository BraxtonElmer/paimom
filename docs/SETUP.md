# Paimom Setup Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18.0.0 or higher
- **PostgreSQL** 14 or higher
- **npm** 9.0.0 or higher
- A **Discord Bot Token** and **Application ID**

## Step 1: Discord Bot Setup

### 1.1 Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your application (e.g., "Paimom")
4. Go to the "Bot" tab
5. Click "Add Bot"
6. Under "Privileged Gateway Intents", enable:
   - MESSAGE CONTENT INTENT (if needed)
   - SERVER MEMBERS INTENT (optional)
7. Copy your **Bot Token** (you'll need this later)

### 1.2 Get Your Application ID

1. Go to the "General Information" tab
2. Copy your **Application ID** (CLIENT_ID)

### 1.3 Invite the Bot to Your Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

## Step 2: PostgreSQL Database Setup

### 2.1 Install PostgreSQL

**Windows:**
- Download from [PostgreSQL.org](https://www.postgresql.org/download/windows/)
- Run the installer
- Remember your password!

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2.2 Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE paimom;

# Create user (optional)
CREATE USER paimom_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE paimom TO paimom_user;

# Exit
\q
```

## Step 3: Project Setup

### 3.1 Clone and Install

```bash
# Navigate to project directory
cd paimom

# Install dependencies
npm install
```

### 3.2 Environment Configuration

1. Copy the example environment file:

```bash
copy .env.example .env
```

2. Edit `.env` with your credentials:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_test_server_id_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paimom
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Environment
NODE_ENV=development
LOG_LEVEL=info
```

### 3.3 Database Migration

Run the database migrations:

```bash
npm run db:migrate
```

Expected output:
```
Testing database connection...
Database connection successful
Running migrations...
Database models synchronized
Migrations completed successfully
```

## Step 4: Deploy Slash Commands

Deploy the slash commands to Discord:

```bash
npm run deploy
```

Expected output:
```
Started refreshing 9 application (/) commands.
Successfully reloaded 9 application (/) commands globally.
Command deployment complete!
```

## Step 5: Start the Bot

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Expected output:
```
Database connection established
Database models synchronized
Logged in as Paimom#1234
Serving 1 guilds
All systems operational
```

## Step 6: Verify Installation

Test the bot in Discord:

1. Type `/ping` - Should respond with latency
2. Type `/help` - Should show all commands
3. Type `/server set` - Set your Genshin server
4. Type `/character info diluc` - Test character data

## Troubleshooting

### Database Connection Errors

**Error:** `ECONNREFUSED`
- **Solution:** Make sure PostgreSQL is running
  ```bash
  # Check status
  psql -U postgres -c "SELECT version();"
  ```

**Error:** `authentication failed`
- **Solution:** Check your DB_PASSWORD in `.env`

### Bot Won't Start

**Error:** `An invalid token was provided`
- **Solution:** Check your DISCORD_TOKEN in `.env`

**Error:** `Missing Access`
- **Solution:** Re-invite the bot with correct permissions

### Commands Not Showing

1. Wait 5-10 minutes (global commands take time)
2. Use GUILD_ID for instant updates during development
3. Restart Discord client
4. Check bot has `applications.commands` scope

### Missing Dependencies

```bash
# Clear cache and reinstall
rd /s /q node_modules
del package-lock.json
npm install
```

## Directory Structure

```
paimom/
├── src/
│   ├── commands/          # Slash commands
│   ├── components/        # Buttons & modals
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   ├── utils/             # Helper functions
│   ├── data/              # Genshin data
│   ├── jobs/              # Scheduled tasks
│   └── index.js           # Main entry
├── database/
│   ├── migrate.js         # Run migrations
│   ├── reset.js           # Reset database
│   └── seed.js            # Seed data
├── config/
│   └── config.js          # App configuration
├── .env                   # Environment variables
└── package.json           # Dependencies
```

## Next Steps

1. **Customize Server Times:** Edit `config/config.js` for your region
2. **Add More Characters:** Edit `src/data/characters.js`
3. **Add More Domains:** Edit `src/data/domains.js`
4. **Test Notifications:** Use `/notifications` commands
5. **Track Builds:** Use `/character track` to test build tracking

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start src/index.js --name paimom

# View logs
pm2 logs paimom

# Restart
pm2 restart paimom

# Stop
pm2 stop paimom
```

### Using Docker

```bash
# Build image
docker build -t paimom .

# Run container
docker run -d --name paimom --env-file .env paimom
```

## Support

- **Documentation:** Check README.md
- **Issues:** Report on GitHub
- **Discord:** Join our support server

---

**Congratulations! Your Paimom bot is now running!**

Use `/help` in Discord to see all available commands.
