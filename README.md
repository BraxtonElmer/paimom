<div align="center">

# Paimom

**Genshin Impact Discord Bot** (TypeScript)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14.14.1-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

An interactive Discord bot providing character builds, resource management, and scheduling tools for Genshin Impact players across all regions.

> **This is the actively maintained TypeScript version.** The [original JavaScript codebase](https://github.com/BraxtonElmer/paimom-legacy) has been fully migrated to TypeScript for improved type safety, maintainability, and developer experience.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Reference](#commands) • [Contributing](#contributing) • [License](#license)

</div>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Character Database](#character-database)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Capabilities

#### Character Database
Complete database of **80+ playable characters** with current meta information (November 2025)

- Comprehensive character information including ascension materials and talent requirements
- Artifact set recommendations with optimal main stats and substats
- Meta-based team composition suggestions
- Integrated character portrait display system
- Real-time character data queries with autocomplete

#### Domain & Server Tracking
Region-specific reset timers and domain schedules across all servers

- Daily domain rotation schedules for talent books and weapon materials
- Automated daily and weekly reset notifications
- Multi-region support: NA, EU, Asia, SAR
- Accurate timezone calculations for all regions
- Customizable notification channels

#### Resin Management System
Smart resin tracking with automated regeneration calculations

- Real-time resin amount tracking
- Automatic regeneration time predictions
- Configurable notification thresholds
- Usage history and analytics
- Refill time calculations

#### Build Tracking
Multi-character progression monitoring with material automation

- Character level and talent level progression tracking
- Automated ascension material requirement calculations
- Domain farming schedule optimization
- Priority-based build management
- Material checklist generation

#### Task Management
Flexible todo system for daily and weekly objectives

- Category-based task organization (dailies, weeklies, farming, events)
- Recurring task automation with customizable intervals
- Resin cost tracking per task
- Task completion history
- Bulk task operations

**Legacy JavaScript Version:** The original codebase is preserved at [paimom-legacy](https://github.com/BraxtonElmer/paimom-legacy) for historical reference but is no longer maintained.

## Installation

### System Requirements

| Component | Minimum Version | Recommended | Purpose |
|-----------|----------------|-------------|---------|
| Node.js | v20.0.0 | v20.19.5+ | Runtime environment |
| TypeScript | v5.0.0 | v5.3.3+ | Type-safe compilation |
| PostgreSQL | v14.0 | v14.19+ | Database system |
| npm | v9.0.0 | Latest | Package manager |

### Prerequisites

Before installation, ensure you have:

1. **Discord Bot Application**
   - Create an application at [Discord Developer Portal](https://discord.com/developers/applications)
   - Enable "Message Content Intent" and "Server Members Intent" under Bot settings
   - Generate and save your Bot Token
   - Copy your Application (Client) ID

2. **PostgreSQL Database**
   - Running PostgreSQL instance (local or remote)
   - Database administrator credentials
   - Network access to database server

3. **System Dependencies**
   - Git for version control
   - Text editor for configuration files

---

## Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/BraxtonElmer/paimom.git
cd paimom
npm install
```

**2. Build TypeScript**
```bash
npm run build
# Compiles TypeScript files from src/ to dist/
```

**3. Set up PostgreSQL**
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE paimom;
CREATE USER paimom_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE paimom TO paimom_user;
\q
```

**3. Configure environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
GUILD_ID=optional_test_guild_id

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paimom
DB_USER=paimom_user
DB_PASSWORD=your_secure_password

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

**4. Initialize database**
```bash
node src/database/migrate.js
```

**5. Deploy slash commands**
```bash
node dist/deploy-commands.js
```

**6. Start the application**

Development mode (with TypeScript auto-reload):
```bash
npm run dev
# Uses ts-node for direct TypeScript execution
```

Production mode (recommended):
```bash
npm start
# Runs compiled JavaScript from dist/
```

Using PM2 (for production with auto-restart):
```bash
pm2 start dist/index.js --name paimom-ts
pm2 save
```

### Verification

After starting the bot, verify the installation:

1. Check console output for "All systems operational"
2. Verify bot appears online in Discord
3. Test with `/ping` command
4. Run `/help` to see all available commands

### Development Workflow

When making changes to TypeScript files:

```bash
# 1. Make your code changes in src/
# 2. Rebuild TypeScript
npm run build

# 3. Restart the bot
pm2 restart paimom-ts
# or if running directly:
npm start
```

### Troubleshooting

**Database Connection Issues**
```bash
# Test PostgreSQL connection
psql -U paimom_user -d paimom -h localhost
```

**Command Registration Issues**
- Global commands may take up to 1 hour to propagate
- Use GUILD_ID in .env for instant testing in a specific server
- Verify CLIENT_ID and DISCORD_TOKEN are correct

**Permission Errors**
- Ensure bot has required Discord permissions
- Check PostgreSQL user has necessary database privileges

> For comprehensive setup instructions and advanced configurations, see [SETUP.md](docs/SETUP.md)

## Commands

All commands use Discord's slash command interface for a modern, intuitive user experience.

### Character Information
- `/list` - Browse all characters with filtering options by element and rarity
- `/character info <name>` - Display character details including materials and talent schedules
- `/character build <name>` - Show recommended artifact sets, stats, and team compositions
- `/character track <name>` - Begin tracking a character's build progression

### Domain Scheduling
- `/domain today` - Display available domains for the current day
- `/domain schedule` - Show the complete weekly domain rotation
- `/domain info <name>` - Retrieve information about a specific domain

### Server Configuration
- `/server set <region>` - Configure your Genshin Impact server region
- `/server info` - Display current server settings and reset timers

### Resin Tracking
- `/resin check` - View current resin amount and regeneration status
- `/resin update <amount>` - Update your current resin count
- `/resin refill` - Calculate time until resin is fully regenerated

### Build Management
- `/builds list` - Display all tracked character builds
- `/builds update <character>` - Modify build progress for a tracked character
- `/builds remove <character>` - Remove a character from build tracking

### Task Organization
- `/todo add <task>` - Create a new task
- `/todo list [category]` - View tasks, optionally filtered by category
- `/todo complete <id>` - Mark a task as completed
- `/todo delete <id>` - Remove a task from the list

### Notifications
- `/notifications enable` - Enable automatic reset notifications
- `/notifications disable` - Disable automatic reset notifications
- `/notifications channel <channel>` - Set the channel for notifications

### Utility
- `/help` - Display interactive command reference organized by category
- `/ping` - Check bot response time and connection status

### Command Features

- **Autocomplete Support**: Character names, domain names, and categories
- **Validation**: Input validation with helpful error messages
- **Ephemeral Responses**: Private responses for sensitive operations
- **Interactive Components**: Buttons, select menus, and modals for enhanced UX

> **Complete API Reference**: See [API.md](docs/API.md) for detailed command documentation, parameters, and examples

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DISCORD_TOKEN` | Yes | - | Discord bot authentication token |
| `CLIENT_ID` | Yes | - | Discord application client ID |
| `GUILD_ID` | No | - | Test guild ID for instant command updates |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host address |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `paimom` | Database name |
| `DB_USER` | Yes | - | Database username |
| `DB_PASSWORD` | Yes | - | Database password |
| `NODE_ENV` | No | `development` | Environment mode (development/production) |
| `LOG_LEVEL` | No | `info` | Logging level (error/warn/info/debug) |

### Database Schema

The application uses PostgreSQL with Sequelize ORM for data persistence. Tables are automatically created on first run:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User preferences and settings | genshinServer, notificationsEnabled, timezone |
| `tracked_builds` | Character build progression | characterName, currentLevel, targetLevel |
| `todo_items` | Task management | title, category, recurring, resinCost |
| `reminders` | Scheduled notifications | type, scheduledTime, recurring |

**Indexes**: Optimized indexes on userId, characterName, and scheduledTime for query performance

### Regional Support

Multi-region support with accurate timezone handling:

| Region | Timezone | Daily Reset | Weekly Reset |
|--------|----------|-------------|--------------|
| NA (North America) | UTC-5 | 04:00 server time | Monday 04:00 |
| EU (Europe) | UTC+1 | 04:00 server time | Monday 04:00 |
| Asia | UTC+8 | 04:00 server time | Monday 04:00 |
| SAR (Taiwan/HK/Macau) | UTC+8 | 04:00 server time | Monday 04:00 |

### Advanced Deployment

#### Docker Deployment

Production-ready containerized deployment:

```bash
# Build and start containers
docker-compose up -d

# View real-time logs
docker-compose logs -f paimom

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

#### Process Management (PM2)

For production environments without Docker:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start src/index.js --name paimom

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs paimom
```

#### Environment-Specific Configuration

**Development**
```env
NODE_ENV=development
LOG_LEVEL=debug
GUILD_ID=your_test_guild_id
```

**Production**
```env
NODE_ENV=production
LOG_LEVEL=info
# Omit GUILD_ID for global command deployment
```

> **Production Deployment Guide**: See [SETUP.md](docs/SETUP.md) for complete production deployment strategies, security best practices, and monitoring setup

---

## Project Structure

```
paimom/
├── assets/
│   └── characters/         Character portrait images
├── config/
│   └── config.js           Environment configuration
├── database/
│   ├── connection.js       PostgreSQL connection setup
│   ├── migrate.js          Database migration utilities
│   └── seed.js             Initial data seeding
├── docs/
│   ├── API.md              API documentation
│   ├── ARCHITECTURE.md     System architecture overview
│   └── SETUP.md            Detailed setup instructions
├── src/
│   ├── commands/           Discord slash command implementations
│   │   ├── builds.js
│   │   ├── character.js
│   │   ├── domain.js
│   │   ├── help.js
│   │   ├── list.js
│   │   ├── notifications.js
│   │   ├── ping.js
│   │   ├── resin.js
│   │   ├── server.js
│   │   └── todo.js
│   ├── data/               Game data and character information
│   │   ├── characters.js
│   │   ├── domains.js
│   │   └── materials.js
│   ├── jobs/               Scheduled background tasks
│   │   ├── reminderJob.js
│   │   └── resetNotificationJob.js
│   ├── models/             Sequelize database models
│   │   ├── Reminder.js
│   │   ├── TodoItem.js
│   │   ├── TrackedBuild.js
│   │   └── User.js
│   ├── services/           Business logic layer
│   │   ├── buildService.js
│   │   ├── reminderService.js
│   │   ├── todoService.js
│   │   └── userService.js
│   ├── utils/              Helper functions
│   │   ├── components.js
│   │   ├── embeds.js
│   │   ├── logger.js
│   │   └── time.js
│   ├── deploy-commands.js
│   └── index.js            Application entry point
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

> For detailed architecture information, see [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](docs/SETUP.md) | Comprehensive installation and configuration guide |
| [API.md](docs/API.md) | Complete command reference and API documentation |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and technical design |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines and development workflow |

---

## Character Database

The bot maintains data for **80 playable characters** with information current as of **November 2025**.

### Element Distribution

<details>
<summary>Click to expand character roster</summary>

| Element | Count | Characters |
|---------|-------|------------|
| Pyro | 13 | Arlecchino, Lyney, Dehya, Yoimiya, Diluc, Hu Tao, Gaming, Chevreuse, Bennett, Xiangling, Yanfei, Xinyan, Amber |
| Hydro | 10 | Neuvillette, Furina, Nilou, Ayato, Yelan, Tartaglia, Kokomi, Mona, Candace, Barbara, Xingqiu |
| Anemo | 11 | Wanderer, Xianyun, Xiao, Venti, Jean, Kazuha, Faruzan, Lynette, Heizou, Sayu, Sucrose |
| Electro | 13 | Clorinde, Cyno, Yae Miko, Keqing, Raiden Shogun, Sethos, Dori, Kuki Shinobu, Sara, Fischl, Beidou, Razor, Lisa |
| Cryo | 14 | Wriothesley, Shenhe, Ayaka, Eula, Ganyu, Qiqi, Charlotte, Freminet, Mika, Layla, Rosaria, Chongyun, Diona, Kaeya |
| Geo | 9 | Navia, Chiori, Itto, Albedo, Zhongli, Gorou, Yun Jin, Ningguang, Noelle |
| Dendro | 10 | Emilie, Kinich, Alhaitham, Nahida, Tighnari, Baizhu, Kaveh, Yaoyao, Collei, Kirara |

### Data Coverage

**Data Coverage per Character:**
- Ascension material requirements
- Talent book schedules and weekly boss materials
- Recommended artifact sets with stat priorities
- Weapon recommendations
- Team composition suggestions
- High-quality character portrait images

</details>

---

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Contribution Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/BraxtonElmer/paimom.git
   cd paimom
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style and conventions
   - Add tests if applicable
   - Update documentation as needed

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # Follow conventional commit format
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub

### Contribution Areas

| Area | Priority | Description |
|------|----------|-------------|
| Character Data | High | Update character information for new releases |
| Bug Fixes | High | Identify and resolve reported issues |
| Feature Development | Medium | Implement new commands and functionality |
| Performance | Medium | Optimize database queries and API calls |
| Documentation | Medium | Improve guides, add examples, fix typos |
| Testing | Low | Add unit and integration tests |
| Localization | Low | Multi-language support implementation |

### Development Guidelines

- **Code Style**: Follow the existing ESLint configuration
- **Commits**: Use conventional commit format (feat, fix, docs, etc.)
- **Testing**: Test locally before submitting PR
- **Documentation**: Update relevant docs for any changes
- **Breaking Changes**: Clearly document any breaking changes

### Getting Help

- Review [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- Ask questions in GitHub Discussions
- Join our community Discord server

---

## License

This project is licensed under the **GNU General Public License v3.0**.

### Key Points

- **Freedom to Use**: Use the software for any purpose
- **Freedom to Study**: Access and modify the source code
- **Freedom to Share**: Distribute copies of the software
- **Copyleft**: Derivative works must also be open source under GPL-3.0

See [LICENSE](LICENSE) for the complete license text.

### Third-Party Licenses

- Discord.js: Apache License 2.0
- Sequelize: MIT License
- Node.js: MIT License
- PostgreSQL: PostgreSQL License

---

## Acknowledgments

### Open Source Credits

This project builds upon the following open source projects and resources:

**Assets & Data**
- [HoYoverse](https://www.hoyoverse.com/) - Genshin Impact game data and intellectual property

**Core Dependencies**
- [Discord.js](https://discord.js.org/) - Discord API wrapper (Apache-2.0)
- [Sequelize](https://sequelize.org/) - PostgreSQL ORM (MIT)
- [Luxon](https://moment.github.io/luxon/) - DateTime library (MIT)
- [Winston](https://github.com/winstonjs/winston) - Logging framework (MIT)

**Community**
- All contributors who have helped improve this project
- The Genshin Impact community for feedback and suggestions
- Discord.js community for technical support

---

## Support & Community

### Get Help

<div align="center">

[![GitHub Issues](https://img.shields.io/github/issues/BraxtonElmer/paimom?style=for-the-badge&logo=github)](https://github.com/BraxtonElmer/paimom/issues)
[![GitHub Discussions](https://img.shields.io/github/discussions/BraxtonElmer/paimom?style=for-the-badge&logo=github)](https://github.com/BraxtonElmer/paimom/discussions)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/BraxtonElmer/paimom?style=for-the-badge&logo=github)](https://github.com/BraxtonElmer/paimom/pulls)

</div>

**Bug Reports**: [Create an Issue](https://github.com/BraxtonElmer/paimom/issues/new?template=bug_report.md)  
**Feature Requests**: [Create an Issue](https://github.com/BraxtonElmer/paimom/issues/new?template=feature_request.md)  
**Questions**: [GitHub Discussions](https://github.com/BraxtonElmer/paimom/discussions)  
**Security Issues**: Please report privately via GitHub Security Advisories

### Project Status

<div align="center">

[![GitHub Stars](https://img.shields.io/github/stars/BraxtonElmer/paimom?style=social)](https://github.com/BraxtonElmer/paimom/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/BraxtonElmer/paimom?style=social)](https://github.com/BraxtonElmer/paimom/network/members)
[![GitHub Watchers](https://img.shields.io/github/watchers/BraxtonElmer/paimom?style=social)](https://github.com/BraxtonElmer/paimom/watchers)

**Maintained**: Active development and maintenance  
**Last Updated**: November 2025  
**Character Database**: Current as of Genshin Impact Version 5.2

</div>

---

<div align="center">

### Built with ❤ for the Genshin Impact community

**[↑ Back to Top](#paimom)**

---

Copyright © 2025 BraxtonElmer. Licensed under GPL-3.0.

</div>
