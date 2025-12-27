# Backend Fix Required for AI Training Screen

## Error
```
SQLSTATE[01000]: Warning: 1265 Data truncated for column 'scrape_status' at row 1
```

## Problem
In your Laravel backend controller's `updateWebsiteContext` method, the code sets:
```php
'scrape_status' => 'manual',
```

But the `scrape_status` column is an ENUM that only accepts: `'pending'`, `'success'`, `'failed'`

## Solution
Change this line in your backend:
```php
'scrape_status' => 'manual',
```

TO:
```php
'scrape_status' => 'success',
```

## Location
File: Your Laravel backend controller (likely `app/Http/Controllers/WebsiteContextController.php` or similar)
Method: `updateWebsiteContext`

This will fix the "Failed to update training data" error in the AI Training screen.
