"use client";

import { useState } from "react";
import { BookMarked, BookOpen, Eye, CheckCircle, Filter, Search, ChevronDown, ChevronUp } from "lucide-react";

interface Kategorie {
  id: number;
  name: string;
  beschreibung: string;
  icon: string;
  color: string;
  reihenfolge: number;
}

interface Regelwerk {
  id: number;
  titel: string;
  beschreibung: string;
  inhalt: string;
  kategorie_id: number;
  kategorie_name: string;
  kategorie_icon: string;
  kategorie_color: string;
  team_name: string | null;
  version: string;
  gueltig_ab: string;
  gelesen: boolean;
  gelesen_am: string | null;
}

interface Props {
  kategorien: Kategorie[];
  regelwerke: Regelwerk[];
  isAdmin: boolean;
}

export default function RegelwerkeView({ kategorien, regelwerke, isAdmin }: Props) {
  const [selectedKategorie, setSelectedKategorie] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRegelwerk, setExpandedRegelwerk] = useState<number | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredRegelwerke = regelwerke.filter(r => {
    const matchesKategorie = !selectedKategorie || r.kategorie_id === selectedKategorie;
    const matchesSearch = !searchTerm || 
      r.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnread = !showUnreadOnly || !r.gelesen;
    return matchesKategorie && matchesSearch && matchesUnread;
  });

  const handleMarkAsRead = async (regelwerkId: number) => {
    try {
      await fetch('/api/regelwerke/gelesen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regelwerk_id: regelwerkId })
      });
      
      // Reload page to update read status
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
    }
  };

  const unreadCount = regelwerke.filter(r => !r.gelesen).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Regelwerke
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? "Alle Regelwerke (Admin/Manager-Ansicht)" : "Deine zugewiesenen Regelwerke"}
            {!isAdmin && unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full">
                {unreadCount} ungelesen
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="card-body space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Regelwerke durchsuchen..."
              className="input pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            
            {!isAdmin && (
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {showUnreadOnly ? 'Nur Ungelesene' : 'Alle anzeigen'}
              </button>
            )}

            <button
              onClick={() => setSelectedKategorie(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedKategorie === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Alle Kategorien ({regelwerke.length})
            </button>

            {kategorien.map(kat => {
              const count = regelwerke.filter(r => r.kategorie_id === kat.id).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategorie(kat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedKategorie === kat.id
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={selectedKategorie === kat.id ? { backgroundColor: kat.color } : {}}
                >
                  {kat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regelwerke Liste */}
      <div className="space-y-4">
        {filteredRegelwerke.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                Keine Regelwerke gefunden
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? "Versuche einen anderen Suchbegriff"
                  : "Es wurden dir noch keine Regelwerke zugewiesen."}
              </p>
            </div>
          </div>
        ) : (
          filteredRegelwerke.map(regelwerk => (
            <div key={regelwerk.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: regelwerk.kategorie_color }}
                      >
                        {regelwerk.kategorie_name}
                      </span>
                      {regelwerk.team_name && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Team: {regelwerk.team_name}
                        </span>
                      )}
                      {!isAdmin && !regelwerk.gelesen && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Ungelesen
                        </span>
                      )}
                      {!isAdmin && regelwerk.gelesen && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Gelesen
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        Version {regelwerk.version}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      {regelwerk.titel}
                    </h3>
                    {regelwerk.beschreibung && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {regelwerk.beschreibung}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${
                  expandedRegelwerk === regelwerk.id ? '' : 'max-h-32 overflow-hidden relative'
                }`}>
                  <div 
                    className="regelwerk-content"
                    dangerouslySetInnerHTML={{ __html: regelwerk.inhalt }}
                  />
                  {expandedRegelwerk !== regelwerk.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-800 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setExpandedRegelwerk(
                      expandedRegelwerk === regelwerk.id ? null : regelwerk.id
                    )}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    {expandedRegelwerk === regelwerk.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Weniger anzeigen
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Vollständig anzeigen
                      </>
                    )}
                  </button>
                  
                  {!isAdmin && !regelwerk.gelesen && (
                    <button
                      onClick={() => handleMarkAsRead(regelwerk.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Als gelesen markieren
                    </button>
                  )}
                </div>

                {/* Metadata */}
                {!isAdmin && regelwerk.gelesen_am && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gelesen am {new Date(regelwerk.gelesen_am).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
