import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import './Calendar.css';
import { CalendarEvent, CalendarEventType } from '../../types';
import { CALENDAR_FILTERS } from '../../constants';
import { EventItem } from './EventItem';
import { CalendarSidePanel } from './CalendarSidePanel';
import { EventModal } from './EventModal';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState(CALENDAR_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<CalendarEvent> | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Transform Supabase snake_case to our camelCase interface if necessary
      // For now we'll assume they match or transform them
      const transformedEvents: CalendarEvent[] = data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        start: item.start_time || item.start,
        end: item.end_time || item.end,
        description: item.description,
        location: item.location,
        color: item.color,
        status: item.status,
        employeeId: item.employee_id,
        candidateId: item.candidate_id,
        teamId: item.team_id
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Subscribe to changes
    const channel = supabase
      .channel('calendar_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'calendar_events',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleFilter = (type: CalendarEventType) => {
    setFilters(prev => prev.map(f => f.type === type ? { ...f, enabled: !f.enabled } : f));
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      filters.find(f => f.type === event.type)?.enabled
    );
  }, [events, filters]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const nextDate = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDate = () => {
    const prev = new Date(currentDate);
    if (viewMode === 'month') prev.setMonth(prev.getMonth() - 1);
    else if (viewMode === 'week') prev.setDate(prev.getDate() - 7);
    else prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const formatDateRange = () => {
    if (viewMode === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return filteredEvents.filter(event => {
      const start = new Date(event.start);
      return start.toDateString() === day.toDateString() && start.getHours() === hour;
    });
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Local update for immediate feedback (though subscription will also trigger fetch)
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      if (selectedEvent?.id === id) {
        setSelectedEvent(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleSaveEvent = async (data: Partial<CalendarEvent>) => {
    if (!user) return;
    
    try {
      const eventData = {
        title: data.title,
        type: data.type,
        start_time: data.start,
        end_time: data.end,
        description: data.description,
        location: data.location,
        user_id: user.id,
        color: CALENDAR_FILTERS.find(f => f.type === data.type)?.color || '#3B82F6',
        status: data.status || 'pending'
      };

      if (data.id) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([eventData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleCellClick = (day: Date, hour: number) => {
    if (selectedEvent) {
      setSelectedEvent(null);
      return;
    }
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    
    setModalInitialData({
      start: start.toISOString(),
      end: end.toISOString()
    });
    setIsModalOpen(true);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const cell = e.currentTarget as HTMLElement;
    cell.classList.add('drag-over');
  };

  const onDragLeave = (e: React.DragEvent) => {
    const cell = e.currentTarget as HTMLElement;
    cell.classList.remove('drag-over');
  };

  const onDrop = async (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    const cell = e.currentTarget as HTMLElement;
    cell.classList.remove('drag-over');
    
    const eventId = e.dataTransfer.getData('text/plain');
    const event = events.find(e => e.id === eventId);
    
    if (event) {
      const originalStart = new Date(event.start);
      const originalEnd = new Date(event.end);
      const duration = originalEnd.getTime() - originalStart.getTime();

      const newStart = new Date(day);
      newStart.setHours(hour, originalStart.getMinutes(), 0, 0);
      const newEnd = new Date(newStart.getTime() + duration);

      try {
        const { error } = await supabase
          .from('calendar_events')
          .update({
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString()
          })
          .eq('id', eventId);
        
        if (error) throw error;
        
        setEvents(prev => prev.map(e => e.id === eventId ? {
          ...e,
          start: newStart.toISOString(),
          end: newEnd.toISOString()
        } : e));
      } catch (error) {
        console.error('Error rescheduling event:', error);
      }
    }
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="header-left">
          <h1 className="calendar-title">Calendar</h1>
          <div className="date-navigation">
            <button onClick={prevDate} className="nav-btn"><ChevronLeft size={20} /></button>
            <span className="current-date-display">{formatDateRange()}</span>
            <button onClick={nextDate} className="nav-btn"><ChevronRight size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="today-btn">Today</button>
          </div>
        </div>

        <div className="header-right">
          <div className="view-switcher">
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button className="create-event-btn" onClick={() => {
            setModalInitialData(undefined);
            setIsModalOpen(true);
          }}>
            <Plus size={20} />
            <span>New Event</span>
          </button>
        </div>
      </header>

      <div className="calendar-content">
        <aside className="calendar-sidebar">
          <div className="filter-section">
            <h3 className="section-title">Event Types</h3>
            <div className="filter-list">
              {filters.map(filter => (
                <label key={filter.type} className="filter-item">
                  <input 
                    type="checkbox" 
                    checked={filter.enabled} 
                    onChange={() => toggleFilter(filter.type)}
                  />
                  <span className="filter-custom-checkbox" style={{ backgroundColor: filter.enabled ? filter.color : 'transparent', borderColor: filter.color }}></span>
                  <span className="filter-label">{filter.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="calendar-main">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-primary-500" size={48} />
            </div>
          ) : viewMode === 'week' ? (
            <div className="week-grid">
              <div className="grid-header">
                <div className="time-col"></div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className={`day-col-header ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                    <span className="day-name">{DAYS[day.getDay()]}</span>
                    <span className="day-number">{day.getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="grid-body">
                {HOURS.map(hour => (
                  <div key={hour} className="hour-row">
                    <div className="time-col">
                      {hour === 0 ? '' : `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`}
                    </div>
                    {weekDays.map(day => {
                      const dayEvents = getEventsForDayAndHour(day, hour);
                      return (
                        <div 
                          key={`${day.toISOString()}-${hour}`} 
                          className="day-hour-cell"
                          onClick={() => handleCellClick(day, hour)}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={(e) => onDrop(e, day, hour)}
                        >
                          {dayEvents.map(event => (
                            <EventItem key={event.id} event={event} onClick={setSelectedEvent} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid-placeholder">
              <div className="empty-state">
                <CalendarIcon size={48} className="empty-icon" />
                <h3>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</h3>
                <p>Grid implementation for this view is coming soon.</p>
              </div>
            </div>
          )}
        </main>

        <CalendarSidePanel 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        initialData={modalInitialData}
      />
    </div>
  );
};
