import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

const sql = neon(process.env.DATABASE_URL!);

// Configure web-push (VAPID keys)
webpush.setVapidDetails(
  'mailto:support@infinity-cheer-allstars.de',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userIds, title, body, url, icon, tag } = await request.json();

    if (!userIds || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: userIds, title, body' },
        { status: 400 }
      );
    }

    // Get push subscriptions for specified users
    const subscriptions = await sql`
      SELECT subscription_data 
      FROM push_subscriptions 
      WHERE user_id = ANY(${userIds})
    `;

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      tag: tag || 'ica-notification',
      data: { url: url || '/' }
    });

    // Send notifications to all subscriptions
    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription_data, payload);
      } catch (error: any) {
        console.error('Failed to send notification:', error);
        // Remove invalid subscription
        if (error?.statusCode === 410) {
          await sql`
            DELETE FROM push_subscriptions 
            WHERE subscription_data = ${JSON.stringify(sub.subscription_data)}
          `;
        }
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ 
      success: true, 
      sent: subscriptions.length 
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}