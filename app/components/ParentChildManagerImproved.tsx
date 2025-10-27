"use client";
import { useState, useEffect } from "react";
import { Users, Link2, Unlink, Mail, User, Plus, Trash2, RotateCcw, Search, AlertTriangle, CheckCircle } from "lucide-react";

interface Parent {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  parent_email?: string;
  team_name?: string;
  team_level?: string;
  link_type?: string;
  relationship_type?: string;
  can_manage?: boolean;
  age?: number;
  birth_date?: string;
}

interface Relationship {
  parent_id: number;
  parent_name: string;
  parent_email: string;
  child_id: number;
  child_name: string;
  link_type: string;
}

interface DatabaseStatus {
  hasParentChildrenTable: boolean;
  totalRelationships: number;
  orphanedChildren: number;
  missingParents: number;
}

export default function ParentChildManagerImproved() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [parentChildren, setParentChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Lade alle Parents
      const parentsRes = await fetch('/api/users?role=parent');
      const parentsData = await parentsRes.json();
      setParents(parentsData.users || []);

      // Lade alle Members
      const membersRes = await fetch('/api/members');
      const membersData = await membersRes.json();
      setAllChildren(membersData.members || []);

      // Lade aktuelle Beziehungen
      await loadRelationships();
      
      // Lade Database Status
      await loadDatabaseStatus();
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseStatus = async () => {
    try {
      const orphanedChildren = allChildren.filter((child: Child) => 
        child.parent_email && !parents.some((parent: Parent) => parent.email === child.parent_email)
      ).length;
      
      setDbStatus({
        hasParentChildrenTable: true,
        totalRelationships: relationships.length,
        orphanedChildren,
        missingParents: orphanedChildren
      });
    } catch (error) {
      console.error('Error loading database status:', error);
    }
  };

  const loadRelationships = async () => {
    try {
      const response = await fetch('/api/parent-children/relationships');
      const data = await response.json();
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error('Error loading relationships:', error);
    }
  };

  const loadChildrenForParent = async (parentId: number) => {
    try {
      const response = await fetch(`/api/parent-children?parentId=${parentId}`);
      const data = await response.json();
      setParentChildren(data.children || []);
    } catch (error) {
      console.error('Error loading children for parent:', error);
      setParentChildren([]);
    }
  };

  const linkChild = async (parentId: number, childId: number) => {
    try {
      const response = await fetch('/api/parent-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link_child',
          parentUserId: parentId,
          childMemberId: childId
        })
      });

      const result = await response.json();
      if (response.ok) {
        showMessage('success', 'Kind erfolgreich verknüpft');
        await loadRelationships();
        if (selectedParent) {
          await loadChildrenForParent(selectedParent);
        }
      } else {
        showMessage('error', result.error || 'Fehler beim Verknüpfen');
      }
    } catch (error) {
      console.error('Error linking child:', error);
      showMessage('error', 'Fehler beim Verknüpfen');
    }
  };

  const unlinkChild = async (parentId: number, childId: number) => {
    try {
      const response = await fetch('/api/parent-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlink_child',
          parentUserId: parentId,
          childMemberId: childId
        })
      });

      const result = await response.json();
      if (response.ok) {
        showMessage('success', 'Verknüpfung entfernt');
        await loadRelationships();
        if (selectedParent) {
          await loadChildrenForParent(selectedParent);
        }
      } else {
        showMessage('error', result.error || 'Fehler beim Entfernen der Verknüpfung');
      }
    } catch (error) {
      console.error('Error unlinking child:', error);
      showMessage('error', 'Fehler beim Entfernen der Verknüpfung');
    }
  };

  const createParentFromEmail = async (email: string) => {
    try {
      const response = await fetch('/api/parent-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_parent_from_email',
          parentEmail: email
        })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', `Parent User für ${email} erstellt und ${data.linkedChildren || 0} Kinder verknüpft`);
        await loadData();
      } else {
        showMessage('error', data.error || 'Fehler beim Erstellen des Parent Users');
      }
    } catch (error) {
      console.error('Error creating parent:', error);
      showMessage('error', 'Fehler beim Erstellen des Parent Users');
    }
  };

  const bulkSyncRelationships = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parent-children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_sync'
        })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('success', `${data.syncedRelationships} von ${data.totalFound} Beziehungen synchronisiert`);
        await loadData();
      } else {
        showMessage('error', data.error || 'Fehler bei der Bulk-Synchronisation');
      }
    } catch (error) {
      console.error('Error bulk syncing:', error);
      showMessage('error', 'Fehler bei der Bulk-Synchronisation');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleParentSelect = (parentId: number) => {
    setSelectedParent(parentId);
    loadChildrenForParent(parentId);
  };

  const filteredParents = parents.filter((parent: Parent) => 
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChildren = allChildren.filter((child: Child) =>
    !selectedParent || !parentChildren.some((pc: Child) => pc.id === child.id)
  ).filter((child: Child) =>
    searchTerm === '' ||
    `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.parent_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unlinkedChildren = allChildren.filter((child: Child) => 
    child.parent_email && !parents.some((parent: Parent) => parent.email === child.parent_email)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Parent-Child Verwaltung (Verbessert)
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Erweiterte Verwaltung der Verknüpfungen zwischen Eltern und Kindern
        </p>
      </div>

      {/* Status Dashboard */}
      {dbStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{parents.length}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Eltern</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{dbStatus.totalRelationships}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Verknüpfungen</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{dbStatus.orphanedChildren}</div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Verwaiste Kinder</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{allChildren.length}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Gesamt Kinder</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Suche nach Namen oder Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={bulkSyncRelationships}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Sync Beziehungen
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {showAdvanced ? 'Einfach' : 'Erweitert'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : message.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Orphaned Children - Priorität geben */}
      {unlinkedChildren.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            🚨 Dringend: Kinder ohne Parent User ({unlinkedChildren.length})
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Diese Kinder haben eine parent_email, aber es existiert kein entsprechender Parent User. 
            Erstelle die Parent Users automatisch für ein vollständiges System.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlinkedChildren.map(child => (
              <div key={child.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <div className="font-medium mb-2">
                  {child.first_name} {child.last_name}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  📧 {child.parent_email}
                  {child.team_name && (
                    <div className="text-xs text-slate-500 mt-1">
                      Team: {child.team_name}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => createParentFromEmail(child.parent_email!)}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-2 w-full"
                >
                  <Plus className="w-4 h-4" />
                  Parent User erstellen
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200">
            <button
              onClick={() => {
                // Bulk create all missing parents
                unlinkedChildren.forEach(child => {
                  if (child.parent_email) {
                    createParentFromEmail(child.parent_email);
                  }
                });
              }}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Alle Parent Users erstellen ({unlinkedChildren.length})
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parents List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Eltern ({filteredParents.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredParents.map(parent => (
              <div
                key={parent.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedParent === parent.id
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleParentSelect(parent.id)}
              >
                <div className="font-medium">{parent.name}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {parent.email}
                </div>
                <div className="text-xs text-slate-500">
                  @{parent.username}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Parent's Children */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedParent 
              ? `Kinder von ${parents.find(p => p.id === selectedParent)?.name}`
              : 'Wähle einen Elternteil'
            }
          </h2>
          {selectedParent ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parentChildren.map(child => (
                <div key={child.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {child.first_name} {child.last_name}
                      </div>
                      {child.team_name && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Team: {child.team_name}
                          {child.team_level && ` (${child.team_level})`}
                        </div>
                      )}
                      {child.age && (
                        <div className="text-xs text-slate-500">
                          Alter: {child.age} Jahre
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        {child.link_type === 'direct_link' ? '🔗 Direkt verknüpft' : '📧 Email-Match'}
                        {child.relationship_type && ` • ${child.relationship_type}`}
                      </div>
                    </div>
                    <button
                      onClick={() => unlinkChild(selectedParent, child.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Verknüpfung entfernen"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {parentChildren.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  Keine Kinder gefunden
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Wähle einen Elternteil aus der Liste links
            </div>
          )}
        </div>

        {/* Available Children */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Verfügbare Kinder
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredChildren.slice(0, 20).map(child => (
              <div key={child.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {child.first_name} {child.last_name}
                    </div>
                    {child.parent_email && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        📧 {child.parent_email}
                      </div>
                    )}
                    {child.team_name && (
                      <div className="text-xs text-slate-500">
                        Team: {child.team_name}
                      </div>
                    )}
                  </div>
                  {selectedParent && (
                    <button
                      onClick={() => linkChild(selectedParent, child.id)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Mit ausgewähltem Elternteil verknüpfen"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredChildren.length > 20 && (
              <div className="text-sm text-slate-500 text-center py-2">
                ... und {filteredChildren.length - 20} weitere
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced View */}
      {showAdvanced && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Alle Verknüpfungen ({relationships.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Elternteil</th>
                  <th className="text-left p-2">Kind</th>
                  <th className="text-left p-2">Typ</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((rel, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="p-2">
                      <div className="font-medium">{rel.parent_name}</div>
                      <div className="text-slate-500 text-xs">{rel.parent_email}</div>
                    </td>
                    <td className="p-2">{rel.child_name}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rel.link_type === 'direct_link' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {rel.link_type === 'direct_link' ? 'Direkt' : 'Email'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-green-600 text-xs">✓ Aktiv</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}