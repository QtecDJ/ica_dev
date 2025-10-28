import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  // Configure web-push (VAPID keys) - only when API is called
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'VAPID keys not configured' },
      { status: 500 }
    );
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@infinity-cheer-allstars.de',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  try {
    const { userIds, title, body, url, icon, tag } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    // Get push subscriptions for specified users or all users if no userIds provided
    let subscriptions;
    if (userIds && userIds.length > 0) {
      subscriptions = await sql`
        SELECT subscription_data 
        FROM push_subscriptions 
        WHERE user_id = ANY(${userIds})
      `;
    } else {
      // Send to all subscribed users
      subscriptions = await sql`
        SELECT subscription_data 
        FROM push_subscriptions
      `;
    }

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