# Push Notifications Test Guide

## Quick Test Steps

### 1. Setup Environment Variables
Add these to your `.env.local` file:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGTY991KpX0TrRuCb7rPBkkvtkJp0DADu1OZtK8v-V6r7-cbiUiTP6fKax9iLv8G2_11L5tIx4kVw7Ppz78upqA
VAPID_PRIVATE_KEY=GqFvAInGbi5tMqUIOw3U1gvhwRwKtUjK2FdHXXGP-8Q
VAPID_SUBJECT=mailto:admin@ica-dev.de
```

### 2. Enable Push Notifications
1. Start the development server: `npm run dev`
2. Log in to the application
3. Look for the push notification permission prompt or button
4. Click "Enable Push Notifications" 
5. Allow browser permission when prompted

### 3. Test Chat Notifications
1. Open the chat/messages page
2. Send a new message
3. You should receive a push notification with:
   - Title: "💬 Neue Nachricht"
   - Body: Message content preview
   - Click notification to navigate to chat

### 4. Test Training Notifications  
1. Navigate to `/trainings/new`
2. Create a new training with:
   - Select a team
   - Set location, date, and time
   - Add any notes (optional)
3. Submit the form
4. You should receive a push notification with:
   - Title: "🏋️ Neues Training: [Team Name]"
   - Body: Date, time, and location
   - Click notification to navigate to trainings

## Browser Developer Tools Testing

### Check Service Worker Registration
1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in sidebar
4. Look for registered service worker at `/push-sw.js`

### Check Push Subscription
1. In Developer Tools, go to "Application" tab
2. Click "Storage" → "IndexedDB" or check Network tab
3. Look for POST requests to `/api/push-subscription`

### Debug Notifications
1. In Developer Tools, go to "Console" tab
2. Look for any errors related to:
   - Service Worker registration
   - Push subscription
   - Notification permissions

## Manual API Testing

### Test Send Notification Endpoint
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {"url": "/dashboard"}
  }'
```

### Check Database Subscriptions
Look for entries in the `push_subscriptions` table after enabling notifications.

## Troubleshooting

### No notification received
- ✅ Check browser permissions are granted
- ✅ Verify VAPID keys are set correctly in environment
- ✅ Ensure service worker is registered
- ✅ Check browser console for errors
- ✅ Verify database has subscription entry

### Service Worker not registering
- ✅ Clear browser cache and reload
- ✅ Check if `/push-sw.js` is accessible
- ✅ Look for registration errors in console

### Permission denied
- ✅ Reset browser permissions for the site
- ✅ Try in incognito/private mode
- ✅ Test in different browser

## Browser Compatibility

- ✅ Chrome: Full support
- ✅ Firefox: Full support  
- ✅ Edge: Full support
- ⚠️ Safari: Requires iOS 16.4+ / macOS 13+

## Success Criteria

✅ User can enable/disable push notifications
✅ Chat messages trigger notifications
✅ Training creation triggers notifications  
✅ Notifications redirect to correct pages when clicked
✅ Invalid subscriptions are cleaned up automatically
✅ Works across different browsers
✅ No errors in browser console