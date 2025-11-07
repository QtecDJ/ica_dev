import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
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

    const userId = session.user.id;
    let oldAvatarUrl: string | null = null;
    
    // Get member_id and old avatar URL
    const memberResult = await sql`
      SELECT member_id FROM users WHERE id = ${userId}
    `;
    
    const memberId = memberResult.length > 0 ? memberResult[0].member_id : null;
    
    // Get old avatar URL from member if exists
    if (memberId) {
      const oldAvatar = await sql`
        SELECT avatar_url FROM members WHERE id = ${memberId}
      `;
      
      if (oldAvatar.length > 0 && oldAvatar[0].avatar_url) {
        oldAvatarUrl = oldAvatar[0].avatar_url;
      }
    }

    // Upload new avatar to Vercel Blob
    const fileExtension = file.name.split('.').pop();
    const blob = await put(`avatars/${userId}-avatar.${fileExtension}`, file, {
      access: 'public',
    });

    // Delete old avatar from Vercel Blob if it exists
    if (oldAvatarUrl && oldAvatarUrl.includes('vercel-storage.com')) {
      try {
        await del(oldAvatarUrl);
        console.log('🗑️ Old avatar deleted:', oldAvatarUrl);
      } catch (error) {
        console.warn('⚠️ Could not delete old avatar:', error);
        // Continue even if deletion fails
      }
    }

    // Update member avatar in database
    if (memberId) {
      await sql`
        UPDATE members 
        SET avatar_url = ${blob.url}
        WHERE id = ${memberId}
      `;
      console.log('✅ Avatar updated for member:', memberId, 'URL:', blob.url);
      
      // Verify the update
      const verifyUpdate = await sql`
        SELECT avatar_url FROM members WHERE id = ${memberId}
      `;
      console.log('🔍 Verification - Avatar URL in DB:', verifyUpdate[0]?.avatar_url);
    } else {
      console.warn('⚠️ No member_id found for user:', userId);
    }
    
    return NextResponse.json({ 
      avatarUrl: blob.url, 
      success: true,
      memberId: memberId
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}
