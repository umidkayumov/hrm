import React from 'react';
import { CalendarEvent } from '../../types';
import { Clock } from 'lucide-react';

interface EventItemProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: CalendarEvent) => void;
  style?: React.CSSProperties;
}

export const EventItem: React.FC<EventItemProps> = ({ event, onClick, onDragStart, style }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'interview': return <Clock size={12} />;
      case 'leave': return <Clock size={12} />;
      case 'shift': return <Clock size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, event);
    }
    // Set data for Native DnD
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class for feedback
    const target = e.target as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove('dragging');
  };

  return (
    <div 
      className={`event-item ${event.type}`}
      style={{ 
        ...style,
        borderLeftColor: event.color,
        backgroundColor: `${event.color}15`
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="event-content">
        <span className="event-title" style={{ color: event.color }}>{event.title}</span>
        <div className="event-meta">
          {getIcon(event.type)}
          <span>{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};
