"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  event_type: string;
  location?: string;
  start_time?: string;
  is_mandatory?: boolean;
  source: 'event' | 'calendar';
}

interface CalendarProps {
  events: CalendarEvent[];
  calendarEvents: CalendarEvent[];
}

export default function Calendar({ events, calendarEvents }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
  const getEventColor = (type: string) => {
    switch (type) {
      case 'competition':
        return 'bg-red-500';
      case 'showcase':
        return 'bg-purple-500';
      case 'training':
        return 'bg-blue-500';
      case 'workshop':
        return 'bg-green-500';
      case 'meeting':
        return 'bg-gray-500';
      case 'holiday':
        return 'bg-yellow-500';
      case 'deadline':
        return 'bg-orange-500';
      case 'reminder':
        return 'bg-pink-500';
      default:
        return 'bg-slate-500';
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
  
  // Render Kalender-Grid
  const renderCalendarDays = () => {
    const days = [];
    
    // Leere Zellen vor dem ersten Tag
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900" />
      );
    }
    
    // Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isTodayDate = isToday(day);
      
      days.push(
        <div
          key={day}
          className={`aspect-square p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
            isTodayDate ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''
          }`}
        >
          <div className="h-full flex flex-col">
            <div className={`text-sm font-semibold mb-1 ${
              isTodayDate 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-slate-900 dark:text-slate-50'
            }`}>
              {day}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <Link
                  key={`${event.source}-${event.id}-${idx}`}
                  href={event.source === 'event' ? `/events/${event.id}` : `/calendar?event=${event.id}`}
                  className="block"
                >
                  <div
                    className={`text-xs px-1.5 py-0.5 rounded text-white truncate hover:opacity-80 transition-opacity ${getEventColor(event.event_type)}`}
                    title={event.title}
                  >
                    {event.start_time && (
                      <span className="font-semibold">{event.start_time.slice(0, 5)} </span>
                    )}
                    {event.title}
                    {event.is_mandatory && <span className="ml-1">*</span>}
                  </div>
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-slate-600 dark:text-slate-400 px-1.5">
                  +{dayEvents.length - 3} mehr
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Heute
          </button>
          <button
            onClick={previousMonth}
            className="p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Legende */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Wettkampf</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Showcase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Training</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Workshop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Meeting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-slate-600 dark:text-slate-400">Feiertag</span>
        </div>
      </div>
      
      {/* Kalender */}
      <div className="card overflow-hidden">
        {/* Wochentage */}
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-900">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Tage */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
      
      {/* Mobile Event Liste */}
      <div className="lg:hidden space-y-2">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
          Events in {monthNames[month]}
        </h3>
        {allEvents
          .filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate.getMonth() === month && eventDate.getFullYear() === year;
          })
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .map((event, idx) => (
            <Link
              key={`mobile-${event.source}-${event.id}-${idx}`}
              href={event.source === 'event' ? `/events/${event.id}` : `/calendar?event=${event.id}`}
              className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${getEventColor(event.event_type)}`}></div>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {event.title}
                </span>
                {event.is_mandatory && (
                  <span className="text-xs text-red-600 dark:text-red-400">*Pflicht</span>
                )}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(event.event_date).toLocaleDateString('de-DE', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: 'short' 
                })}
                {event.start_time && ` • ${event.start_time.slice(0, 5)}`}
                {event.location && ` • ${event.location}`}
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  );
}
