"use client";

import { useEffect, useState } from "react";
import { Database, Server, Settings, Shield, AlertTriangle, CheckCircle, Globe, GitBranch, Clock, Cpu } from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";

interface SystemInfo {
  vercel: {
    region: string;
    deploymentUrl: string;
    environment: string;
    gitBranch: string;
    gitCommitSha: string;
    gitCommitMessage: string;
    buildTime: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
    nextjsVersion: string;
  };
  deployment: {
    deploymentId: string;
    state: string;
    createdAt: string;
    ready: boolean;
    source: string;
    target: string;
  } | null;
  database: {
    status: string;
    provider: string;
  };
  performance: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    uptime: {
      seconds: number;
      formatted: string;
    };
  };
}

export default function AdminSystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemInfo();
    // Aktualisiere alle 30 Sekunden
    const interval = setInterval(fetchSystemInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/admin/system-info');
      if (!response.ok) {
        throw new Error('Failed to fetch system info');
      }
      const data = await response.json();
      setSystemInfo(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'connected':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'building':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="alert-error">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Fehler beim Laden der System-Informationen</h3>
            <p>{error}</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (!systemInfo) {
    return (
      <AdminGuard>
        <div>Keine System-Informationen verfügbar</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                System Administration
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Live Vercel Server-Informationen und System-Status
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchSystemInfo()}
            className="btn-secondary flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Aktualisieren
          </button>
        </div>

        {/* Vercel Deployment Info */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-black" />
              <h2 className="text-lg font-semibold">Vercel Deployment</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Environment</div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemInfo.vercel.environment)}`}>
                  {systemInfo.vercel.environment}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Region</div>
                <div className="font-mono text-sm">{systemInfo.vercel.region}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">URL</div>
                <div className="font-mono text-sm truncate">{systemInfo.vercel.deploymentUrl}</div>
              </div>
              {systemInfo.deployment && (
                <>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deployment Status</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemInfo.deployment.state)}`}>
                      {systemInfo.deployment.state}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Deployment ID</div>
                    <div className="font-mono text-xs">{systemInfo.deployment.deploymentId.substring(0, 12)}...</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Ready</div>
                    <div className="flex items-center gap-1">
                      {systemInfo.deployment.ready ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm">{systemInfo.deployment.ready ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Git Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold">Git Information</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Branch</div>
                <div className="font-mono text-sm">{systemInfo.vercel.gitBranch}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Commit SHA</div>
                <div className="font-mono text-sm">{systemInfo.vercel.gitCommitSha.substring(0, 8)}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-slate-600 dark:text-slate-400">Commit Message</div>
                <div className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded mt-1">
                  {systemInfo.vercel.gitCommitMessage}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold">System Status</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Datenbank</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(systemInfo.database.status)}`}>
                    {systemInfo.database.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Provider</span>
                  <span className="text-sm">{systemInfo.database.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vercel Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold">Runtime Info</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Node.js</span>
                  <span className="font-mono text-sm">{systemInfo.vercel.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next.js</span>
                  <span className="font-mono text-sm">{systemInfo.vercel.nextjsVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform</span>
                  <span className="font-mono text-sm">{systemInfo.vercel.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>Architecture</span>
                  <span className="font-mono text-sm">{systemInfo.vercel.architecture}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold">Performance</h2>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Heap Used</span>
                  <span className="font-mono text-sm">{systemInfo.performance.memoryUsage.heapUsed} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Heap Total</span>
                  <span className="font-mono text-sm">{systemInfo.performance.memoryUsage.heapTotal} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>RSS</span>
                  <span className="font-mono text-sm">{systemInfo.performance.memoryUsage.rss} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-mono text-sm">{systemInfo.performance.uptime.formatted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings - Simplified for production */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-slate-600" />
              <h2 className="text-lg font-semibold">System-Einstellungen</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Production Environment</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Diese Anwendung läuft auf Vercel. System-Einstellungen werden über Environment Variables 
                    und Vercel Dashboard verwaltet.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Environment Variables</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>DATABASE_URL</span>
                    <span className={`px-2 py-1 rounded text-xs ${systemInfo.database.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {systemInfo.database.status === 'connected' ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>NEXTAUTH_SECRET</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Configured</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VERCEL_ENV</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{systemInfo.vercel.environment}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Deployment Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Build Time</span>
                    <span className="text-xs">{new Date(systemInfo.vercel.buildTime).toLocaleString()}</span>
                  </div>
                  {systemInfo.deployment && (
                    <div className="flex justify-between">
                      <span>Deployed</span>
                      <span className="text-xs">{new Date(systemInfo.deployment.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}