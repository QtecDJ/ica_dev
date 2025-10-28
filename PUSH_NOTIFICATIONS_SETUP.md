# Push Notifications Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key_here
VAPID_PRIVATE_KEY=your_private_vapid_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

## Generating VAPID Keys

### Option 1: Using web-push CLI
```bash
npx web-push generate-vapid-keys
```

### Option 2: Using Node.js
```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

## Component Integration

Add the `PushNotifications` component to your layout or main page:

```tsx
import PushNotifications from '@/app/components/PushNotifications';

export default function Layout() {
  return (
    <div>
      {/* Your existing layout */}
      <PushNotifications />
    </div>
  );
}
```

## Features

### Automatic Notifications
- **Chat Messages**: Users receive push notifications when new messages are posted
- **Training Creation**: Team members get notified when new trainings are scheduled
- **Click-to-Navigate**: Notifications redirect users to relevant pages when clicked

### User Control
- Users can enable/disable push notifications through the UI
- Permissions are requested only when user clicks the enable button
- Subscriptions are automatically cleaned up if invalid

## Production Deployment

1. Generate VAPID keys for production
2. Set environment variables on your hosting platform
3. Ensure HTTPS is enabled (required for push notifications)
4. Test notifications work across different browsers

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Requires iOS 16.4+ / macOS 13+
- Mobile browsers: Generally supported

## Troubleshooting

### No notifications received
1. Check browser permissions
2. Verify VAPID keys are set correctly
3. Ensure service worker is registered
4. Check browser developer tools for errors

### Service Worker issues
1. Clear browser cache and reload
2. Check if service worker is properly registered
3. Verify push-sw.js is accessible at /push-sw.js

## Technical Details

- Uses Web Push API with VAPID authentication
- Service Worker handles background notifications
- Database stores user subscriptions with cleanup for invalid ones
- Integrates with existing authentication system