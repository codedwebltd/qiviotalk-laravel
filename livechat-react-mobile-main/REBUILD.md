# Rebuild Commands

## Git Commit
```bash
# Stage changes
git add app/ src/

# Commit
git commit -m "Add AI agent settings, redesign docs with interactive UI, and fix notification service

- Created professional AI agent settings screen with shimmer loading
- Redesigned documentation with expandable/collapsible steps and progress tracking
- Added shimmer loading to widget screen
- Fixed notificationService circular dependency issue
- Moved settings to new settings/ directory structure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## EAS Build (Android)
```bash
# Trigger Android build
npx eas-cli build --platform android --profile preview
```

## Notes
- iOS build requires Apple Developer account ($99/year)
- Android build uses preview profile for testing
