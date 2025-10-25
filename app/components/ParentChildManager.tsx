"use client";
import { useState, useEffect } from "react";
import { Users, Link2, Unlink, Mail, User, Plus, Trash2 } from "lucide-react";

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
  link_type?: string;
}

interface Relationship {
  parent_id: number;
  parent_name: string;
  parent_email: string;
  child_id: number;
  child_name: string;
  link_type: string;
}

export default function ParentChildManager() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [parentChildren, setParentChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
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

      if (response.ok) {
        showMessage('success', 'Kind erfolgreich verknüpft');
        await loadRelationships();
        if (selectedParent) {
          await loadChildrenForParent(selectedParent);
        }
      } else {
        showMessage('error', 'Fehler beim Verknüpfen');
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

      if (response.ok) {
        showMessage('success', 'Verknüpfung entfernt');
        await loadRelationships();
        if (selectedParent) {
          await loadChildrenForParent(selectedParent);
        }
      } else {
        showMessage('error', 'Fehler beim Entfernen der Verknüpfung');
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
        showMessage('success', `Parent User für ${email} erstellt`);
        await loadData();
      } else {
        showMessage('error', data.error || 'Fehler beim Erstellen des Parent Users');
      }
    } catch (error) {
      console.error('Error creating parent:', error);
      showMessage('error', 'Fehler beim Erstellen des Parent Users');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleParentSelect = (parentId: number) => {
    setSelectedParent(parentId);
    loadChildrenForParent(parentId);
  };

  const unlinkedChildren = allChildren.filter(child => 
    child.parent_email && !parents.some(parent => parent.email === child.parent_email)
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
          Parent-Child Verwaltung
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Verwalte die Verknüpfungen zwischen Eltern und Kindern
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parents List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Eltern ({parents.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {parents.map(parent => (
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
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        {child.link_type === 'direct_link' ? '🔗 Direkt verknüpft' : '📧 Email-Match'}
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
            {allChildren
              .filter(child => selectedParent ? 
                !parentChildren.some(pc => pc.id === child.id) : true
              )
              .map(child => (
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
          </div>
        </div>
      </div>

      {/* Orphaned Children */}
      {unlinkedChildren.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-200">
            Kinder ohne Parent User ({unlinkedChildren.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlinkedChildren.map(child => (
              <div key={child.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <div className="font-medium mb-2">
                  {child.first_name} {child.last_name}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  📧 {child.parent_email}
                </div>
                <button
                  onClick={() => createParentFromEmail(child.parent_email!)}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Parent User erstellen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Relationships Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">
          Aktuelle Verknüpfungen ({relationships.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Elternteil</th>
                <th className="text-left p-2">Kind</th>
                <th className="text-left p-2">Typ</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((rel, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <div>{rel.parent_name}</div>
                    <div className="text-slate-500 text-xs">{rel.parent_email}</div>
                  </td>
                  <td className="p-2">{rel.child_name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      rel.link_type === 'direct_link' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rel.link_type === 'direct_link' ? 'Direkt' : 'Email'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}