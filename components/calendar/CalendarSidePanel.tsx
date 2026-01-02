import React from 'react';
import { X, Clock, MapPin, AlignLeft, User, Users, Calendar as CalendarIcon, Trash2, Edit3, Check, MinusCircle } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface CalendarSidePanelProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: 'approved' | 'rejected') => void;
  onDelete?: (id: string) => void;
}

export const CalendarSidePanel: React.FC<CalendarSidePanelProps> = ({ event, onClose, onStatusChange, onDelete }) => {
  if (!event) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`side-panel ${event ? 'open' : ''}`}>
      <div className="side-panel-header">
        <button onClick={onClose} className="close-btn"><X size={20} /></button>
        <div className="panel-actions">
          <button className="icon-btn"><Edit3 size={18} /></button>
          <button onClick={() => onDelete?.(event.id)} className="icon-btn delete"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="side-panel-content">
        <div className="event-type-badge" style={{ backgroundColor: `${event.color}15`, color: event.color }}>
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </div>
        
        <h2 className="panel-title">{event.title}</h2>
        
        <div className="panel-details-list">
          <div className="detail-item">
            <CalendarIcon size={18} className="detail-icon" />
            <div className="detail-text">
              <p className="detail-label">Time</p>
              <p className="detail-value">{formatDate(event.start)}</p>
            </div>
          </div>

          {event.location && (
            <div className="detail-item">
              <MapPin size={18} className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Location</p>
                <p className="detail-value">{event.location}</p>
              </div>
            </div>
          )}

          {(event.employeeId || event.candidateId) && (
            <div className="detail-item">
              {event.candidateId ? <User size={18} className="detail-icon" /> : <Users size={18} className="detail-icon" />}
              <div className="detail-text">
                <p className="detail-label">{event.candidateId ? 'Candidate' : 'Employee'}</p>
                <p className="detail-value">{event.candidateId || event.employeeId}</p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="detail-item">
              <AlignLeft size={18} className="detail-icon" />
              <div className="detail-text">
                <p className="detail-label">Description</p>
                <p className="detail-value description-text">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {event.type === 'leave' && event.status === 'pending' && (
          <div className="panel-footer-actions">
            <button 
              onClick={() => onStatusChange?.(event.id, 'approved')} 
              className="approve-btn"
            >
              <Check size={18} />
              Approve Leave
            </button>
            <button 
              onClick={() => onStatusChange?.(event.id, 'rejected')} 
              className="reject-btn"
            >
              <MinusCircle size={18} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
