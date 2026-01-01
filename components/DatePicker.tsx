import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = 'Select date', label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handleSelectDay = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
          ${isOpen 
            ? 'border-primary-500 ring-4 ring-primary-100 bg-white' 
            : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'
          }
        `}
      >
        <div className={`p-2 rounded-lg ${value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
          <Icons.Calendar size={18} />
        </div>
        <span className={value ? 'text-slate-900 font-medium' : 'text-gray-400'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handlePrevYear}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Icons.Left size={16} />
              </button>
              <span className="font-bold text-lg">{viewDate.getFullYear()}</span>
              <button
                onClick={handleNextYear}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Icons.Right size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Icons.Left size={18} />
              </button>
              <span className="font-semibold text-xl">{MONTHS[viewDate.getMonth()]}</span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Icons.Right size={18} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => handleSelectDay(day)}
                      className={`
                        w-full h-full rounded-xl text-sm font-medium transition-all
                        ${isSelected(day)
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110'
                          : isToday(day)
                            ? 'bg-primary-50 text-primary-600 border-2 border-primary-200'
                            : 'text-slate-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  onChange(`${year}-${month}-${day}`);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="flex-1 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
