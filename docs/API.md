# API Reference

## Commands

### /server

#### /server set
Set your Genshin Impact server region.

**Options:**
- `region` (required): Your server region
  - `asia` - Asia Server
  - `na` - America Server
  - `eu` - Europe Server
  - `tw` - TW/HK/MO Server

**Response:** Confirmation embed with reset times

---

#### /server info
View your current server settings and reset countdown.

**Response:** Embed showing:
- Current server region
- Time until daily reset
- Time until weekly reset
- Notification settings

---

### /notifications

#### /notifications toggle
Enable or disable all notifications.

**Options:**
- `enabled` (required): Boolean

---

#### /notifications daily
Toggle daily reset notifications.

**Options:**
- `enabled` (required): Boolean

---

#### /notifications weekly
Toggle weekly reset notifications.

**Options:**
- `enabled` (required): Boolean

---

#### /notifications channel
Set where notifications are sent.

**Options:**
- `target` (optional): Channel (empty = DM)

---

#### /notifications settings
View your current notification configuration.

---

### /character

#### /character info
View detailed character information including materials and talent schedule.

**Options:**
- `name` (required, autocomplete): Character name

**Response:** Embed with:
- Ascension materials
- Talent materials
- Boss drops
- Recommended weapons

---

#### /character build
View recommended builds for a character.

**Options:**
- `name` (required, autocomplete): Character name

**Response:** Embed with:
- Artifact sets
- Main stats
- Substats
- Team compositions

---

#### /character track
Start tracking a character's build progress.

**Options:**
- `name` (required, autocomplete): Character name
- `current_level` (optional): Current level (1-90)
- `target_level` (optional): Target level (1-90)

**Response:** Confirmation embed

---

### /builds

#### /builds list
View all your tracked character builds.

**Response:** Paginated list of builds with:
- Character name
- Level progress
- Talent levels
- Priority

---

#### /builds details
View detailed material requirements for a build.

**Options:**
- `build_id` (required): Build ID from list

**Response:** Embed with:
- Ascension materials needed
- Talent materials needed
- Total mora cost
- Interactive buttons

---

#### /builds update
Update your build progress.

**Options:**
- `build_id` (required): Build ID
- `current_level` (optional): New level
- `normal_attack` (optional): Normal attack level
- `skill` (optional): Elemental skill level
- `burst` (optional): Elemental burst level

---

#### /builds delete
Stop tracking a character build.

**Options:**
- `build_id` (required): Build ID to delete

---

### /todo

#### /todo add
Add a new task to your to-do list.

**Response:** Modal form with:
- Title (required)
- Description (optional)
- Category (optional)
- Resin cost (optional)

---

#### /todo list
View your to-do list.

**Options:**
- `category` (optional): Filter by category
  - `all`, `domain`, `boss`, `farming`, `resin`, `daily`, `weekly`

**Response:** List of todos with:
- Completion status
- Category emoji
- Title and description
- Resin cost

---

#### /todo complete
Mark a task as complete.

**Options:**
- `task_id` (required): Task ID from list

**Note:** Recurring tasks automatically create next instance

---

#### /todo delete
Delete a task from your list.

**Options:**
- `task_id` (required): Task ID to delete

---

### /domain

#### /domain schedule
View today's available domains based on your server.

**Response:** Categorized list:
- Talent domains
- Weapon domains
- Artifact domains (always available)

---

#### /domain search
Search for information about a specific domain.

**Options:**
- `name` (required, autocomplete): Domain name

**Response:** Embed with:
- Domain type
- Location
- Resin cost
- Weekly schedule
- Available materials/sets

---

### /resin

#### /resin check
Check your current resin amount and regeneration time.

**Response:** Embed with:
- Current resin
- Progress bar
- Time until full

---

#### /resin set
Set your current resin amount to start tracking.

**Options:**
- `amount` (required): Current resin (0-160)

---

#### /resin use
Subtract resin you just spent.

**Options:**
- `amount` (required): Resin spent (1-160)

---

### /help
Display all available commands and features.

---

### /ping
Check bot latency and API response time.

**Response:** Ephemeral message with:
- Bot latency
- API latency

---

## Interactive Components

### Buttons

#### build_update_{id}
Opens modal to update build progress.

**Triggers:** Modal form

---

#### build_materials_{id}
Shows domain schedule and material sources.

**Response:** Ephemeral embed

---

### Modals

#### todo_add_modal
Form for creating a new todo item.

**Fields:**
- `todo_title`: Task title (required)
- `todo_description`: Description (optional)
- `todo_category`: Category (optional)
- `todo_resin`: Resin cost (optional)

---

#### build_update_modal_{id}
Form for updating build progress.

**Fields:**
- `current_level`: Character level
- `normal_attack`: Normal attack level
- `skill_level`: Elemental skill level
- `burst_level`: Elemental burst level

---

## Data Structures

### Character Object
```javascript
{
  name: String,
  element: String,
  weapon: String,
  rarity: Number,
  ascensionMaterial: String,
  localSpecialty: String,
  commonMaterial: String,
  bossMaterial: String,
  weeklyBoss: String,
  talentBooks: String,
  talentDays: Array<String>,
  recommendedArtifacts: Array<Object>,
  mainStats: Object,
  substats: Array<String>,
  recommendedWeapons: Array<String>,
  teams: Array<Array<String>>
}
```

### Domain Object
```javascript
{
  name: String,
  type: String,
  location: String,
  books?: Array<String>,
  materials?: Array<String>,
  sets?: Array<String>,
  schedule?: Object,
  resinCost: Number
}
```

### User Settings
```javascript
{
  genshinServer: 'asia' | 'na' | 'eu' | 'tw',
  notificationsEnabled: Boolean,
  dailyResetNotifications: Boolean,
  weeklyResetNotifications: Boolean,
  notificationChannel: String | null,
  resinAmount: Number,
  resinLastUpdated: Date
}
```

### Tracked Build
```javascript
{
  characterName: String,
  currentLevel: Number,
  targetLevel: Number,
  currentAscension: Number,
  normalAttackLevel: Number,
  elementalSkillLevel: Number,
  elementalBurstLevel: Number,
  targetNormalAttack: Number,
  targetElementalSkill: Number,
  targetElementalBurst: Number,
  materialsCollected: Object,
  priority: Number
}
```

### Todo Item
```javascript
{
  title: String,
  description: String | null,
  category: 'domain' | 'boss' | 'farming' | 'resin' | 'daily' | 'weekly' | 'other',
  completed: Boolean,
  dueDate: Date | null,
  recurring: 'none' | 'daily' | 'weekly',
  linkedCharacter: String | null,
  resinCost: Number
}
```

---

## Error Codes

### Common Errors

**Character not found**
```
Character not found! Please use autocomplete to select a valid character.
```

**Build not found**
```
Build not found or you don't have permission to view it.
```

**Invalid permissions**
```
You can only complete your own tasks!
```

**Database error**
```
An error occurred while processing your request.
```

---

## Rate Limits

- Commands: Follows Discord's rate limits (50 per second)
- API calls: Automatic rate limit handling
- Database: Connection pooling (max 5 concurrent)

---

## Response Times

- Slash commands: < 3 seconds
- Button interactions: < 1 second
- Modal submissions: < 2 seconds
- Autocomplete: < 500ms

---

## Permissions Required

### Bot Permissions
- Send Messages
- Embed Links
- Read Message History
- Use Application Commands

### User Permissions
- None (all users can use all commands)

---

## Webhooks & Events

### Scheduled Jobs

**ReminderJob**
- Frequency: Every minute
- Purpose: Send pending reminders
- Triggers: DM notifications

**ResetNotificationJob**
- Frequency: Hourly
- Purpose: Schedule reset reminders
- Triggers: Creates reminder records

---

## Changelog

### Version 1.0.0
- Initial release
- Core command set
- Database integration
- Scheduled notifications
- Interactive UI components
