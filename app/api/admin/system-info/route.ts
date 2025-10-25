import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-utils';

// Vercel System Information API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Nur Admins können diese Informationen abrufen
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vercel Environment Informationen
    const vercelInfo = {
      // Vercel spezifische Environment Variables
      region: process.env.VERCEL_REGION || 'unknown',
      deploymentUrl: process.env.VERCEL_URL || 'localhost',
      environment: process.env.VERCEL_ENV || 'development',
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      gitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'Local development',
      buildTime: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
      
      // Node.js Runtime Informationen
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      
      // Memory Usage (in Production läuft das auf Vercel's Servern)
      memoryUsage: process.memoryUsage(),
      
      // Uptime
      uptime: process.uptime(),
      
      // Next.js spezifische Informationen
      nextjsVersion: require('next/package.json').version,
    };

    // Zusätzliche Vercel Deployment Informationen über API
    let deploymentInfo = null;
    if (process.env.VERCEL_ACCESS_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/deployments?limit=1`, {
          headers: {
            'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.deployments && data.deployments.length > 0) {
            const latest = data.deployments[0];
            deploymentInfo = {
              deploymentId: latest.uid,
              state: latest.state,
              createdAt: latest.createdAt,
              ready: latest.ready,
              source: latest.source,
              target: latest.target,
            };
          }
        }
      } catch (error) {
        console.warn('Failed to fetch Vercel deployment info:', error);
      }
    }

    // Database Connection Status
    let dbStatus = 'unknown';
    try {
      if (process.env.DATABASE_URL) {
        dbStatus = 'connected';
      } else {
        dbStatus = 'not_configured';
      }
    } catch (error) {
      dbStatus = 'error';
    }

    const systemInfo = {
      vercel: vercelInfo,
      deployment: deploymentInfo,
      database: {
        status: dbStatus,
        provider: process.env.DATABASE_URL ? 'neon' : 'none',
      },
      performance: {
        memoryUsage: {
          rss: Math.round(vercelInfo.memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(vercelInfo.memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(vercelInfo.memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(vercelInfo.memoryUsage.external / 1024 / 1024),
        },
        uptime: {
          seconds: Math.round(vercelInfo.uptime),
          formatted: formatUptime(vercelInfo.uptime),
        },
      },
    };

    return NextResponse.json(systemInfo);

  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system information' },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}