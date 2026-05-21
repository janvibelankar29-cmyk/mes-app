import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from '../components/ui/Card';
import { PlusCircle, X } from 'lucide-react';

const localizer = momentLocalizer(moment);

const initialEvents = [
  {
    id: 1,
    title: 'WO-1042 (CNC-01)',
    start: new Date(new Date().setHours(8, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
    type: 'production'
  },
  {
    id: 2,
    title: 'Maintenance (Molding-03)',
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(17, 0, 0, 0)),
    type: 'downtime'
  }
];

const Calendar = () => {
  const [events, setEvents] = useState(initialEvents);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'production', date: '' });

  const eventStyleGetter = (event) => {
    let backgroundColor = event.type === 'downtime' ? '#ef4444' : '#3b82f6';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 8px',
        fontWeight: '500',
        fontSize: '0.8rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }
    };
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    const start = new Date(newEvent.date);
    const end = new Date(start);
    end.setHours(start.getHours() + 4); // Default 4 hour block

    setEvents([...events, { id: Date.now(), title: newEvent.title, type: newEvent.type, start, end }]);
    setShowModal(false);
    setNewEvent({ title: '', type: 'production', date: '' });
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Production Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Interactive calendar for planning work orders and maintenance.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
        >
          <PlusCircle size={16} /> Schedule Event
        </button>
      </div>

      <Card className="flex-1 flex flex-col min-h-[600px] overflow-hidden">
        <CardContent className="flex-1 p-4">
          <style dangerouslySetInnerHTML={{__html: `
            .rbc-calendar { font-family: inherit; border: none; }
            .rbc-header { padding: 12px 10px; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
            .dark .rbc-header { color: #94a3b8; border-color: #334155; }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; background: white; }
            .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view { border-color: #334155; background: #0f172a; }
            .rbc-day-bg { border-color: #f1f5f9; }
            .dark .rbc-day-bg { border-color: #1e293b; }
            .rbc-today { background-color: #f8fafc; }
            .dark .rbc-today { background-color: #1e293b; }
            .rbc-off-range-bg { background-color: #fcfcfc; }
            .dark .rbc-off-range-bg { background-color: #0b1121; }
            .rbc-event { transition: transform 0.2s; cursor: pointer; }
            .rbc-event:hover { transform: scale(1.02); z-index: 10; }
            .rbc-toolbar button { border-radius: 0.5rem; padding: 0.5rem 1rem; color: #475569; border: 1px solid #e2e8f0; margin-left: 0.5rem; }
            .dark .rbc-toolbar button { color: #cbd5e1; border-color: #334155; }
            .rbc-toolbar button.rbc-active { background-color: #f1f5f9; color: #0f172a; font-weight: 500; }
            .dark .rbc-toolbar button.rbc-active { background-color: #334155; color: white; }
          `}} />
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="week"
            onSelectEvent={e => alert(`Selected: ${e.title}`)}
          />
        </CardContent>
      </Card>

      {/* Add Event Modal Overlay */}
      {showModal && (
        <div className="absolute inset-0 bg-gray-900/40 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Schedule New Event</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="e.g. WO-1045 or Maintenance" 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Type</label>
                <select 
                  value={newEvent.type}
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100"
                >
                  <option value="production">Production (Work Order)</option>
                  <option value="downtime">Maintenance (Downtime)</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
