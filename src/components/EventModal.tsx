import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CalendarEvent, DialTheme, EventCategory } from '../types/calendar';

interface EventModalProps {
  isOpen: boolean;
  initialDateKey: string;
  editingEvent: CalendarEvent | null;
  theme: DialTheme;
  onClose: () => void;
  onSave: (eventData: Omit<CalendarEvent, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'shop', label: 'Shop & Build' },
  { value: 'personal', label: 'Personal' },
  { value: 'milestone', label: 'Milestone' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  initialDateKey,
  editingEvent,
  theme,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [dateKey, setDateKey] = useState(initialDateKey);
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<EventCategory>('personal');
  const [notes, setNotes] = useState('');
  const [pinnedToCorner, setPinnedToCorner] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDateKey(editingEvent.dateKey);
      setTime(editingEvent.time || '');
      setEndTime(editingEvent.endTime || '');
      setCategory(editingEvent.category);
      setNotes(editingEvent.notes || '');
      setPinnedToCorner(Boolean(editingEvent.pinnedToCorner));
    } else {
      setTitle('');
      setDateKey(initialDateKey);
      setTime('');
      setEndTime('');
      setCategory('personal');
      setNotes('');
      setPinnedToCorner(false);
    }
  }, [isOpen, editingEvent, initialDateKey]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateKey) return;
    onSave(
      {
        title: title.trim(),
        dateKey,
        time: time || undefined,
        endTime: endTime || undefined,
        category,
        notes: notes.trim() || undefined,
        completed: editingEvent?.completed ?? false,
        pinnedToCorner,
      },
      editingEvent?.id
    );
    onClose();
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="w-full max-w-md rounded-lg border p-6 shadow-xl"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.inkSubtle,
          color: theme.ink,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="event-modal-title" className="font-dial text-xl font-bold">
            {editingEvent ? 'Edit Event' : 'New Calendar Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-md hover:opacity-75 cursor-pointer"
            style={{ color: theme.inkMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Shop Inspection Certification, Dinner, Project Deadline"
              className="w-full px-3 py-2 text-sm rounded-md border bg-transparent outline-none focus:ring-1"
              style={{ borderColor: theme.inkSubtle, color: theme.ink }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-transparent font-mono-tabular outline-none focus:ring-1"
                style={{ borderColor: theme.inkSubtle, color: theme.ink }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none focus:ring-1"
                style={{
                  borderColor: theme.inkSubtle,
                  backgroundColor: theme.panelBg,
                  color: theme.ink,
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Start Time (optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-transparent font-mono-tabular outline-none focus:ring-1"
                style={{ borderColor: theme.inkSubtle, color: theme.ink }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">
                End Time (optional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-transparent font-mono-tabular outline-none focus:ring-1"
                style={{ borderColor: theme.inkSubtle, color: theme.ink }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional details..."
              className="w-full px-3 py-2 text-sm rounded-md border bg-transparent outline-none focus:ring-1 resize-none"
              style={{ borderColor: theme.inkSubtle, color: theme.ink }}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pinnedToCorner}
              onChange={(e) => setPinnedToCorner(e.target.checked)}
              className="mt-0.5 rounded"
            />
            <span className="text-xs leading-snug">
              <strong className="font-semibold">
                Pin as corner callout on dial
              </strong>
              <span
                className="block mt-0.5"
                style={{ color: theme.inkMuted }}
              >
                Draws a starred annotation and pointer arrow to this date on the
                circular calendar.
              </span>
            </span>
          </label>

          <div
            className="pt-3 border-t flex items-center justify-between gap-3"
            style={{ borderColor: theme.inkSubtle }}
          >
            {editingEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingEvent.id);
                  onClose();
                }}
                className="px-3 py-2 text-xs font-semibold rounded-md border hover:opacity-80 cursor-pointer"
                style={{ borderColor: theme.inkSubtle, color: theme.inkMuted }}
              >
                Delete
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-md border hover:opacity-80 cursor-pointer"
                style={{ borderColor: theme.inkSubtle, color: theme.ink }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-md hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: theme.cellSelectedBg,
                  color: theme.cellSelectedText,
                }}
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
