import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Type, AlignLeft, Info } from 'lucide-react';
import { CalendarEvent, CalendarEventType } from '../../types';
import { CALENDAR_FILTERS } from '../../constants';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  initialData?: Partial<CalendarEvent>;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'interview',
    start: '',
    end: '',
    description: '',
    ...initialData
  });

  const [isAdvanced, setIsAdvanced] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header className="modal-header">
          <h2>{initialData?.id ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label><Type size={16} /> Title</label>
            <input 
              type="text" 
              placeholder="Event Title" 
              required 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><CalendarIcon size={16} /> Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as CalendarEventType })}
              >
                {CALENDAR_FILTERS.map(f => (
                  <option key={f.type} value={f.type}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Clock size={16} /> Start Time</label>
              <input 
                type="datetime-local" 
                required 
                value={formData.start ? formData.start.slice(0, 16) : ''}
                onChange={e => setFormData({ ...formData, start: new Date(e.target.value).toISOString() })}
              />
            </div>
            <div className="form-group">
              <label><Clock size={16} /> End Time</label>
              <input 
                type="datetime-local" 
                required 
                value={formData.end ? formData.end.slice(0, 16) : ''}
                onChange={e => setFormData({ ...formData, end: new Date(e.target.value).toISOString() })}
              />
            </div>
          </div>

          <div className="form-toggle-advanced">
            <button 
              type="button" 
              onClick={() => setIsAdvanced(!isAdvanced)}
              className="advanced-toggle-btn"
            >
              <Info size={16} />
              {isAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>

          {isAdvanced && (
            <div className="advanced-section">
              <div className="form-group">
                <label><AlignLeft size={16} /> Description</label>
                <textarea 
                  placeholder="Add more details..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  placeholder="Zoom, Google Meet, or Physical Office"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};
