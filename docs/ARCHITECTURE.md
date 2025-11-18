# Architecture Documentation

## System Overview

Paimom is a multi-layer Discord bot application designed for scalability, maintainability, and interactive user experience.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           Discord API / Gateway             │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│         Discord.js Client Layer             │
│  (Event Handling & Interaction Routing)     │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│          Command/Component Layer            │
│   (Slash Commands, Buttons, Modals)         │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│            Service Layer                    │
│  (Business Logic & Data Processing)         │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│             Model Layer                     │
│      (Database Abstraction - ORM)           │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│         PostgreSQL Database                 │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. Discord Client (`src/index.js`)

**Responsibilities:**
- Initialize Discord.js client
- Load and register commands/components
- Route interactions to appropriate handlers
- Manage bot lifecycle and events
- Error handling and logging

**Key Features:**
- Dynamic command loading from filesystem
- Component-based interaction handling
- Global error handling
- Graceful shutdown

### 2. Commands Layer (`src/commands/`)

**Pattern:** Command Pattern
**Structure:**
```javascript
{
  data: SlashCommandBuilder,
  autocomplete?: Function,
  execute: Function
}
```

**Commands:**
- `/server` - Server management
- `/notifications` - Notification settings
- `/character` - Character information
- `/builds` - Build tracking
- `/todo` - Task management
- `/domain` - Domain schedules
- `/resin` - Resin tracking
- `/help` - Help system
- `/ping` - Health check

### 3. Components Layer (`src/components/`)

**Buttons (`components/buttons/`):**
- `buildUpdate` - Trigger build update modal
- `buildMaterials` - Show material requirements

**Modals (`components/modals/`):**
- `todoAddModal` - Add new todo item
- `buildUpdateModal` - Update build progress

**Pattern:** Component-based architecture with custom ID routing

### 4. Service Layer (`src/services/`)

**Purpose:** Encapsulate business logic and data operations

**Services:**

**UserService:**
```javascript
- getOrCreateUser(userId)
- updateServer(userId, server)
- updateNotificationSettings(userId, settings)
- updateResin(userId, amount)
- getUsersByServer(server)
```

**BuildService:**
```javascript
- trackCharacter(userId, characterName, options)
- getUserBuilds(userId)
- calculateRequiredMaterials(buildId)
- updateBuild(buildId, updates)
- deleteBuild(buildId)
```

**TodoService:**
```javascript
- createTodo(userId, data)
- getUserTodos(userId, includeCompleted)
- completeTodo(todoId)
- updateTodo(todoId, updates)
- deleteTodo(todoId)
```

**ReminderService:**
```javascript
- createReminder(userId, data)
- getUserReminders(userId)
- getPendingReminders()
- markReminderAsSent(reminderId)
- createDailyResetReminder(userId, server)
- createWeeklyResetReminder(userId, server)
```

### 5. Model Layer (`src/models/`)

**ORM:** Sequelize
**Database:** PostgreSQL

**Models:**

**User:**
```javascript
{
  id: String (Discord ID),
  genshinServer: Enum,
  notificationsEnabled: Boolean,
  dailyResetNotifications: Boolean,
  weeklyResetNotifications: Boolean,
  notificationChannel: String,
  resinLastUpdated: Date,
  resinAmount: Integer,
  timezone: String
}
```

**TrackedBuild:**
```javascript
{
  id: Integer,
  userId: String,
  characterName: String,
  currentLevel: Integer,
  targetLevel: Integer,
  currentAscension: Integer,
  normalAttackLevel: Integer,
  elementalSkillLevel: Integer,
  elementalBurstLevel: Integer,
  materialsCollected: JSONB,
  priority: Integer
}
```

**TodoItem:**
```javascript
{
  id: Integer,
  userId: String,
  title: String,
  description: Text,
  category: Enum,
  completed: Boolean,
  dueDate: Date,
  recurring: Enum,
  linkedCharacter: String,
  resinCost: Integer
}
```

**Reminder:**
```javascript
{
  id: Integer,
  userId: String,
  type: Enum,
  title: String,
  message: Text,
  scheduledTime: Date,
  sent: Boolean,
  recurring: Boolean,
  recurringPattern: String,
  metadata: JSONB
}
```

### 6. Data Layer (`src/data/`)

**Static Game Data:**
- `characters.js` - Character information, builds, materials
- `domains.js` - Domain schedules and rewards
- `materials.js` - Material calculations and sources

**Design:** Immutable data structures with helper functions

### 7. Utility Layer (`src/utils/`)

**Modules:**
- `logger.js` - Winston-based logging
- `embeds.js` - Discord embed helpers
- `components.js` - UI component builders
- `time.js` - Time calculations for resets

### 8. Jobs Layer (`src/jobs/`)

**Scheduled Tasks:**

**ReminderJob:**
- Runs every minute
- Checks for pending reminders
- Sends notifications via DM

**ResetNotificationJob:**
- Runs hourly
- Schedules daily/weekly reset reminders
- Manages per-server timing

**Technology:** node-cron

## Data Flow Examples

### Example 1: User Tracks a Character

```
1. User → /character track diluc
2. Discord → Bot (interaction event)
3. Bot → character.js command handler
4. Handler → buildService.trackCharacter()
5. Service → getCharacter() from data layer
6. Service → TrackedBuild.create() (model)
7. Model → PostgreSQL INSERT
8. Service → return build object
9. Handler → create embed response
10. Bot → Discord (reply to user)
```

### Example 2: Daily Reset Notification

```
1. Cron Job → ResetNotificationJob (hourly)
2. Job → Get users with notifications enabled
3. Job → Calculate next reset time
4. Job → reminderService.createDailyResetReminder()
5. Service → Reminder.create() (model)
6. Model → PostgreSQL INSERT

--- Later when reminder time arrives ---

7. Cron Job → ReminderJob (every minute)
8. Job → Get pending reminders
9. Job → Send DM to user
10. Job → reminderService.markAsSent()
11. Service → Update reminder record
```

### Example 3: Interactive Build Update

```
1. User → Click "Update Progress" button
2. Discord → Button interaction
3. Bot → buildUpdate.js button handler
4. Handler → Show modal form
5. User → Submit modal with data
6. Discord → Modal interaction
7. Bot → buildUpdateModal.js modal handler
8. Handler → buildService.updateBuild()
9. Service → TrackedBuild.update()
10. Model → PostgreSQL UPDATE
11. Handler → Send confirmation embed
```

## Scalability Considerations

### Horizontal Scaling

**Strategy:** Sharding for 2500+ servers

```javascript
// Future: index.js
const manager = new ShardingManager('./src/index.js', {
  token: config.discord.token,
  totalShards: 'auto',
});

manager.spawn();
```

### Database Optimization

**Indexes:**
- User lookups by Discord ID
- Build queries by userId
- Reminder queries by scheduledTime and sent status
- Todo queries by userId and completed

**Connection Pooling:**
```javascript
pool: {
  max: 5,      // Max connections
  min: 0,      // Min connections
  acquire: 30000,
  idle: 10000,
}
```

### Caching Strategy

**Future Implementation:**
- Redis for session data
- In-memory cache for character data
- Query result caching with TTL

### Rate Limiting

**Discord API:**
- Built-in rate limit handling via Discord.js
- Exponential backoff
- Request queuing

**Custom Rate Limiting:**
```javascript
// Future: Per-user command cooldowns
const cooldowns = new Collection();
```

## Security

### Environment Variables
- All secrets in `.env`
- Never commit tokens
- Use different tokens per environment

### Input Validation
- Zod schemas for data validation
- SQL injection prevention via Sequelize
- XSS prevention in embeds

### Error Handling
- Try-catch in all async operations
- Graceful degradation
- User-friendly error messages
- Detailed logging for debugging

## Monitoring & Logging

### Winston Logger Levels
- `error` - Critical failures
- `warn` - Non-critical issues
- `info` - General information
- `debug` - Detailed debugging

### Log Files
- `logs/error.log` - Error-level only
- `logs/combined.log` - All levels
- Console output in development

### Health Checks
- `/ping` command for latency
- Database connection monitoring
- Scheduled job status

## Future Enhancements

### Phase 2 Features
- Web dashboard
- Advanced statistics
- Team builder with synergy calculator
- Artifact optimizer
- Wish history tracker

### Technical Improvements
- GraphQL API layer
- WebSocket for real-time updates
- Redis caching
- Prometheus metrics
- Docker orchestration
- CI/CD pipeline
- Automated testing suite

---

This architecture provides a solid foundation for growth while maintaining code quality and user experience.
