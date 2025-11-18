# Contributing to Paimom

Thank you for your interest in contributing to Paimom! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/BraxtonElmer/paimom.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Add: your feature description"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

Follow the setup guide in `docs/SETUP.md` to get your development environment running.

## Code Standards

### JavaScript Style

- Use ES6+ features
- Use `const` for constants, `let` for variables
- Use async/await over promises
- Use template literals for string interpolation
- Follow existing code formatting

### Naming Conventions

- Files: camelCase (e.g., `userService.js`)
- Classes: PascalCase (e.g., `UserService`)
- Functions: camelCase (e.g., `getUser()`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RESIN`)
- Database tables: snake_case (e.g., `tracked_builds`)

### File Organization

```
src/
├── commands/         # One file per command
├── components/
│   ├── buttons/      # Button handlers
│   └── modals/       # Modal handlers
├── services/         # Business logic
├── models/           # Database models
├── utils/            # Helper functions
├── data/             # Static game data
└── jobs/             # Scheduled tasks
```

## Adding New Features

### Adding a New Command

1. Create file in `src/commands/yourCommand.js`
2. Export default object with `data` and `execute`
3. Register in `src/index.js` (automatic if in commands folder)
4. Deploy: `npm run deploy`

Example:
```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Example command'),

  async execute(interaction) {
    await interaction.reply('Hello!');
  },
};
```

### Adding Character Data

Edit `src/data/characters.js`:

```javascript
characterName: {
  name: 'Character Name',
  element: 'Pyro',
  weapon: 'Sword',
  rarity: 5,
  // ... other fields
},
```

### Adding a Domain

Edit `src/data/domains.js`:

```javascript
domain_key: {
  name: 'Domain Name',
  type: 'talent' | 'weapon' | 'artifact',
  location: 'Region, Nation',
  // ... other fields
},
```

## Database Changes

### Adding a Model

1. Create model file in `src/models/YourModel.js`
2. Define schema using Sequelize
3. Export model
4. Add to `src/models/index.js`
5. Run migration: `npm run db:migrate`

### Modifying Existing Models

1. Update model definition
2. Test with `npm run db:reset` (development only!)
3. Document changes in PR

## Testing

### Manual Testing Checklist

- [ ] Commands respond correctly
- [ ] Autocomplete works
- [ ] Buttons trigger expected behavior
- [ ] Modals accept and validate input
- [ ] Database operations complete successfully
- [ ] Error messages are user-friendly
- [ ] Permissions are respected

### Testing in Discord

1. Use a test server
2. Add test bot with same code
3. Test all interaction paths
4. Check error handling

## Pull Request Guidelines

### PR Title Format

- `Add: New feature description`
- `Fix: Bug description`
- `Update: Changed feature`
- `Docs: Documentation changes`
- `Refactor: Code improvement`

### PR Description Should Include

- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How was it tested?
- **Screenshots**: If UI changes

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console.log() statements
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No sensitive data (tokens, passwords)

## Adding Game Data

### Character Information

Required fields:
- Basic info (name, element, weapon, rarity)
- All material requirements
- Talent schedule and materials
- Recommended builds
- Team compositions

Sources:
- Genshin Impact Wiki
- Honey Impact
- KQM (KeqingMains) guides

### Keeping Data Updated

- Monitor game updates
- Update character data for new releases
- Fix errors reported by users
- Add community-requested features

## Code Review Process

1. Submit PR
2. Automated checks run
3. Maintainer reviews code
4. Address feedback
5. Approval and merge

## Community Guidelines

- Be respectful and constructive
- Help others in discussions
- Report bugs with details
- Suggest features clearly
- Give credit to sources

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Join Discord for real-time help

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Paimom!
