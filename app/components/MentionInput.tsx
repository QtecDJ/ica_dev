"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string | null;
  role: string;
}

interface MentionInputProps {
  contacts: Contact[];
  value: string;
  onChange: (value: string) => void;
  onSelectRecipient: (recipientId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MentionInput({
  contacts,
  value,
  onChange,
  onSelectRecipient,
  disabled,
  placeholder = "Beginne mit @benutzername um einen Empfänger auszuwählen...",
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prüfe ob ein @ gefolgt von Text vorhanden ist
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Prüfe ob nach dem @ noch ein Leerzeichen kam (dann ist mention abgeschlossen)
      if (!textAfterAt.includes(" ")) {
        const query = textAfterAt.toLowerCase();
        const filtered = contacts.filter((contact) =>
          contact.name.toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
          setFilteredContacts(filtered);
          setMentionStart(lastAtIndex);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }

    setShowSuggestions(false);
    setMentionStart(-1);
  }, [value, cursorPosition, contacts]);

  const handleSelectContact = (contact: Contact) => {
    if (mentionStart === -1) return;

    // Ersetze @query mit @vollständigem Namen
    const before = value.substring(0, mentionStart);
    const after = value.substring(cursorPosition);
    const newValue = `${before}@${contact.name} ${after}`;

    onChange(newValue);
    onSelectRecipient(contact.id);
    setShowSuggestions(false);
    setMentionStart(-1);

    // Fokus zurück auf Textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = mentionStart + contact.name.length + 2; // +2 für @ und Leerzeichen
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredContacts.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredContacts.length) % filteredContacts.length);
    } else if (e.key === "Enter" && filteredContacts.length > 0) {
      e.preventDefault();
      handleSelectContact(filteredContacts[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      manager: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      coach: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      parent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onClick={handleTextareaClick}
        onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        className="input min-h-[120px] font-mono text-sm"
        placeholder={placeholder}
        disabled={disabled}
      />

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredContacts.map((contact, index) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelectContact(contact)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left ${
                index === selectedIndex ? "bg-slate-100 dark:bg-slate-700" : ""
              }`}
            >
              <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {contact.name}
                </div>
                {contact.email && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {contact.email}
                  </div>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getRoleBadgeColor(contact.role)}`}>
                {contact.role}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Tippe @ gefolgt vom Namen, um einen Empfänger zu erwähnen
      </p>
    </div>
  );
}
