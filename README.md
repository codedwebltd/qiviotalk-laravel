# Qiviotalk - Laravel Live Chat Platform

A powerful live chat platform built with Laravel, featuring real-time messaging, Firebase push notifications, and AI-powered chat assistance.

## Features

- 🔥 Real-time chat using Pusher
- 📱 Firebase Cloud Messaging (FCM) for push notifications
- 🤖 AI-powered chat responses using Groq API
- 👥 Multi-widget support for different websites
- 📊 Analytics and visitor tracking
- 🌍 Geolocation-based visitor information
- 💳 Subscription and payment management
- 🎨 Customizable chat widgets

## Requirements

- PHP 8.1+
- MySQL 5.7+
- Composer
- Node.js & NPM
- Firebase Project
- Pusher Account
- Groq API Key (for AI features)

## Installation

1. Clone the repository
```bash
git clone https://github.com/codedwebltd/qiviotalk-laravel.git
cd qiviotalk-laravel
```

2. Install dependencies
```bash
composer install
npm install
```

3. Configure environment
```bash
cp .env.example .env
php artisan key:generate
```

4. Set up database
```bash
# Update .env with your database credentials
php artisan migrate
```

5. Configure Firebase
- Place your Firebase credentials JSON file in `storage/app/firebase/`
- Update `FIREBASE_CREDENTIALS` path in `.env`

6. Configure Pusher
- Add your Pusher credentials to `.env`

7. Build assets
```bash
npm run build
```

## Configuration

### Firebase Setup
1. Create a Firebase project
2. Download service account credentials
3. Enable Firebase Cloud Messaging
4. Update `.env` with Firebase credentials path

### Pusher Setup
1. Create a Pusher account
2. Create a new app
3. Add credentials to `.env`

### AI Configuration
1. Get Groq API key from https://console.groq.com
2. Add to `.env`:
```
AI_ENABLED=true
GROQ_API_KEY=your_groq_api_key
GROQ_API_MODEL=llama-3.1-70b-versatile
```

## Widget Installation

Generate a widget for your website:
```php
// In your admin panel, create a new widget
// Copy the embed code and add to your website
<script src="https://yourdomain.com/widgets/widget-{key}.js" async defer></script>
```

## API Endpoints

### Public Endpoints
- `POST /api/widgets/verify` - Verify widget installation
- `POST /api/widgets/conversations/start` - Start a new conversation
- `POST /api/widgets/messages/send` - Send message from visitor
- `GET /api/widgets/messages/visitor` - Get visitor messages

### Protected Endpoints (Require Authentication)
- `GET /api/conversations` - List conversations
- `GET /api/conversations/{id}` - Get conversation details
- `POST /api/conversations/{id}/messages` - Send message from agent
- `POST /api/fcm-token` - Update FCM token

## License

Proprietary - CodedWeb Ltd

## Support

For support, email support@codedweb.com




# Basic usage
php artisan widgets:update-scripts

# Custom chunk size (process 100 widgets at a time)
php artisan widgets:update-scripts --chunk=100

# Use a specific queue
php artisan widgets:update-scripts --queue=widget-updates

# Run synchronously for testing/small updates
php artisan widgets:update-scripts --sync

# How to call this directly from a controller in admin ui
dispatch(new \App\Jobs\BulkUpdateWidgetScripts(10));


 Perfect! I've updated the artisan command to support obfuscation. Now you have two ways to obfuscate widgets:

  Summary of changes:

  1. WidgetController (API - Mobile App updates)

  - ✅ Obfuscation is always enabled when widgets are updated via API
  - Located at WidgetController.php:496-575

  2. Artisan Command (Manual regeneration)

  - ✅ Added --obfuscate flag support
  - Without flag: Generates unobfuscated widgets (like before)
  - With flag: Generates obfuscated widgets

  Test the updated command:

  Run this to obfuscate all widgets:
  php artisan widgets:update-scripts --obfuscate

  Or for a single widget:
  php artisan widgets:update-scripts 17c85cfaae847782e30627dd5a480034 --obfuscate

  This will:
  1. Generate the widget templates
  2. Obfuscate the JavaScript
  3. Save the obfuscated files
  4. Log success to Laravel logs

  Try running it and then check the Laravel logs for the obfuscation success messages! The logs should show:
  - ✅ Artisan command: JavaScript obfuscation successful
  - Original and obfuscated file sizes

---

## Feature Limits & Usage Tracking

### Feature Key Naming Convention

When adding new features to subscription plans via the admin UI, follow these strict naming rules:

#### ✅ CORRECT Format (Singular + Suffix)
```
conversation_limit       ← Tracks monthly conversations
ai_response_limit        ← Tracks monthly AI responses
widget_limit             ← Tracks total widgets owned
team_member_limit        ← Tracks team members
whatsapp_message_limit   ← Tracks WhatsApp messages
sms_message_limit        ← Tracks SMS messages
```

#### ❌ WRONG Format (Avoid These)
```
conversations_limit      ← ❌ Plural form
ai_responses_limit       ← ❌ Plural form
conversationLimit        ← ❌ camelCase
conversation-limit       ← ❌ Hyphenated
ConversationLimit        ← ❌ PascalCase
```

### Rules:
1. **Use SINGULAR form** - `conversation` NOT `conversations`
2. **Use snake_case** - `ai_response_limit` NOT `aiResponseLimit`
3. **End with `_limit`** - for countable features
4. **Be descriptive** - `whatsapp_message_limit` NOT `wa_msg_limit`

### Usage in Code:
```php
// Check if user can create a conversation
if (!$user->features()->canUse('conversation')) {
    return 'Limit reached';
}

// Increment usage after creating
$user->features()->incrementUsage('conversation');

// Get current usage
$usage = $user->features()->getUsage('conversation');

// Get remaining quota
$remaining = $user->features()->remainingUsage('conversation');
```

### Feature Usage Tracking:
- Usage is tracked monthly in the `feature_usages` table
- Format: `user_id`, `feature_key`, `usage_count`, `period` (e.g., "2025-12")
- Run calculation: `php artisan usage:calculate`
- Dry run: `php artisan usage:calculate --dry-run`

### Current Features Tracked:
- `conversation` - Monthly conversations created
- `ai_response` - Monthly AI bot responses sent

### Adding New Features:
When adding a new trackable feature:
1. Add `{feature}_limit` to subscription `feature_limits` JSON
2. Use singular form: `email_limit`, `report_limit`, etc.
3. Add tracking code in relevant controller
4. Update usage calculation command if needed

