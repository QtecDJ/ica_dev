import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-utils';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max size is 5MB.' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`, file, {
      access: 'public',
    });

    // Update user avatar in database
    const userId = session.user.id;
    
    // Check if user has a member_id (for coach/member/parent)
    if (session.user.role !== 'admin') {
      const memberResult = await sql`
        SELECT member_id FROM users WHERE id = ${userId}
      `;
      
      if (memberResult.length > 0 && memberResult[0].member_id) {
        // Update member avatar
        await sql`
          UPDATE members 
          SET avatar_url = ${blob.url}
          WHERE id = ${memberResult[0].member_id}
        `;
      }
    }
    
    return NextResponse.json({ 
      avatarUrl: blob.url, 
      success: true 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
