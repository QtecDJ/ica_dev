"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, X } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  event_type: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  is_mandatory?: boolean;
  source: 'event' | 'calendar';
}

interface CalendarProps {
  events: CalendarEvent[];
  calendarEvents: CalendarEvent[];
}

export default function Calendar({ events, calendarEvents }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const allEvents = [...events, ...calendarEvents];
  
  // Monat und Jahr
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Ersten Tag des Monats
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Wochentag des ersten Tags (0 = Sonntag, anpassen für Montag start)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Montag
  
  // Anzahl Tage im Monat
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Vorheriger/Nächster Monat
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const today = () => {
    setCurrentDate(new Date());
  };
  
  // Events für einen bestimmten Tag
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allEvents.filter(event => event.event_date.startsWith(dateStr));
  };
  
  // Event-Typ Farbe
  const getEventDotColor = (type: string) => {
    switch (type) {
      case 'competition': return 'bg-red-500';
      case 'showcase': return 'bg-purple-500';
      case 'training': return 'bg-blue-500';
      case 'workshop': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Ist heute?
  const isToday = (day: number) => {
    const now = new Date();
    return now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
  };
  
  // Monatsnamen
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  // Render Kalender-Grid - Clean & Simple
  const renderCalendarDays = () => {
    const days = [];
    
    // Leere Zellen
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />);
    }
    
    // Tage
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isTodayDate = isToday(day);
      const hasEvents = dayEvents.length > 0;
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDay(day === selectedDay ? null : day)}
          className="relative p-2 group"
        >
          <div className={`
            w-full aspect-square flex flex-col items-center justify-center rounded-lg
            transition-all duration-200
            ${isTodayDate 
              ? 'bg-red-600 text-white font-bold' 
              : selectedDay === day
                ? 'bg-slate-200 dark:bg-slate-700'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}>
            <span className={`text-sm ${isTodayDate ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              {day}
            </span>
            {hasEvents && !isTodayDate && (
              <div className="flex gap-1 mt-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full ${getEventDotColor(event.event_type)}`}
                  />
                ))}
              </div>
            )}
            {hasEvents && isTodayDate && (
              <div className="flex gap-1 mt-1">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div key={idx} className="w-1 h-1 rounded-full bg-white opacity-80" />
                ))}
              </div>
            )}
          </div>
        </button>
      );
    }
    
    return days;
  };
  
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const monthEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header - Clean */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
          >
            Heute
          </button>
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Kalender - Minimalistisch */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6">
          {/* Wochentage */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Tage */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Event Details für ausgewählten Tag */}
      {selectedDay && selectedDayEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedDay}. {monthNames[month]} {year}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedDayEvents.map((event, idx) => (
                <Link
                  key={idx}
                  href={event.source === 'event' ? `/events/${event.id}` : `/calendar?event=${event.id}`}
                  className="block p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className={`w-1 rounded-full ${getEventDotColor(event.event_type)}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {event.title}
                        {event.is_mandatory && (
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">Pflicht</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        {event.start_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.start_time.slice(0, 5)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event-Liste des Monats */}
      {!selectedDay && monthEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Termine in {monthNames[month]}
          </h3>
          {monthEvents.map((event, idx) => {
            const eventDate = new Date(event.event_date);
            const isTodayEvent = isToday(eventDate.getDate());
            
            return (
              <Link
                key={idx}
                href={event.source === 'event' ? `/events/${event.id}` : `/calendar?event=${event.id}`}
                className="block"
              >
                <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800 transition-colors">
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center
                    ${isTodayEvent 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }
                  `}>
                    <span className="text-xs font-medium uppercase">
                      {eventDate.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </span>
                    <span className="text-xl font-bold">
                      {eventDate.getDate()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {event.title}
                      {event.is_mandatory && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">Pflicht</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      {event.start_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.start_time.slice(0, 5)}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
