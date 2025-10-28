import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const subscription = await request.json();

    // Save subscription to database
    await sql`
      INSERT INTO push_subscriptions (user_id, subscription_data, created_at)
      VALUES (${userId}, ${JSON.stringify(subscription)}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        subscription_data = ${JSON.stringify(subscription)},
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    await sql`
      DELETE FROM push_subscriptions 
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}