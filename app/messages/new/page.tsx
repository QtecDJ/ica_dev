'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: number;
  name: string;
  email: string;
  contact_type?: string;
  team_name?: string;
}

export default function NewMessagePage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Lade verfügbare Kontakte
  useEffect(() => {
    async function loadContacts() {
      try {
        const response = await fetch('/api/messages/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: selectedContact,
          subject: subject.trim() || 'Neue Nachricht',
          content: message.trim()
        })
      });

      if (response.ok) {
        router.push(`/messages/${selectedContact}`);
      } else {
        const error = await response.json();
        alert('Fehler beim Senden: ' + (error.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Fehler beim Senden der Nachricht');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/messages" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            Neue Nachricht
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Wähle einen Empfänger und schreibe deine Nachricht
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-4xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Empfänger auswählen */}
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Empfänger *
              </label>
              {loadingContacts ? (
                <div className="text-center py-4">Lade Kontakte...</div>
              ) : (
                <select
                  id="recipient"
                  value={selectedContact || ''}
                  onChange={(e) => setSelectedContact(Number(e.target.value) || null)}
                  className="input w-full"
                  required
                >
                  <option value="">Empfänger auswählen...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.contact_type === 'admin' ? 'Administrator' : 
                        contact.team_name ? `Coach - ${contact.team_name}` : 
                        contact.contact_type || 'Kontakt'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Betreff */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Betreff (optional)
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input w-full"
                placeholder="Betreff der Nachricht..."
              />
            </div>

            {/* Nachricht */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nachricht *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input w-full h-32"
                placeholder="Schreibe deine Nachricht hier..."
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Link href="/messages" className="btn-secondary">
                Abbrechen
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedContact || !message.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Wird gesendet...' : 'Nachricht senden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}