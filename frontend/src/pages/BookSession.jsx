import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { userAPI } from '../services/api';
import './BookSession.css';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatHumanDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const buildMonthGrid = (cursorMonth) => {
  const year = cursorMonth.getFullYear();
  const month = cursorMonth.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const firstGridDay = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);
    return date;
  });
};

const BookSession = () => {
  const todayDateKey = useMemo(() => formatDateKey(new Date()), []);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [availability, setAvailability] = useState({
    session: null,
    slots: [],
    timezone: 'Asia/Calcutta',
    date: todayDateKey,
    isPastDate: false,
    bookingEnabled: true,
    blockedReason: '',
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotTime, setBookingSlotTime] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [reschedulingBookingId, setReschedulingBookingId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [rescheduleSelectedDate, setRescheduleSelectedDate] = useState('');

  const daysInCalendar = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const loadAvailability = async (date) => {
    setLoadingSlots(true);
    try {
      const { data } = await userAPI.getSessionBookingAvailability(date);
      setAvailability({
        session: data?.session || null,
        slots: Array.isArray(data?.slots) ? data.slots : [],
        timezone: data?.timezone || 'Asia/Calcutta',
        date: data?.date || date,
        isPastDate: Boolean(data?.isPastDate),
        bookingEnabled: data?.bookingEnabled !== false,
        blockedReason: data?.blockedReason || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load slots for this date');
      setAvailability((prev) => ({ ...prev, slots: [] }));
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const { data } = await userAPI.getMySessionBookings();
      setMyBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch {
      setMyBookings([]);
    }
  };

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const selectedDatePretty = useMemo(() => formatHumanDate(selectedDate), [selectedDate]);

  const onBookSlot = async (slotTime) => {
    setBookingSlotTime(slotTime);
    try {
      await userAPI.bookSessionSlot({
        bookingDate: selectedDate,
        slotTime,
      });
      toast.success(`Session booked for ${selectedDatePretty}`);
      await Promise.all([loadAvailability(selectedDate), loadMyBookings()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to book this slot');
    } finally {
      setBookingSlotTime('');
    }
  };

  const onRescheduleBooking = async (bookingId, newDate, newSlotTime) => {
    if (!newDate || !newSlotTime) {
      toast.error('Please select a new date and time');
      return;
    }
    setReschedulingBookingId(bookingId);
    try {
      await userAPI.rescheduleSessionBooking(bookingId, {
        bookingDate: newDate,
        slotTime: newSlotTime,
      });
      toast.success('Booking rescheduled successfully');
      await Promise.all([loadAvailability(newDate), loadMyBookings()]);
      setReschedulingBookingId(null);
      setRescheduleSelectedDate('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reschedule booking');
      setReschedulingBookingId(null);
    }
  };

  const onCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingBookingId(bookingId);
    try {
      await userAPI.cancelSessionBooking(bookingId);
      toast.success('Booking cancelled successfully');
      await Promise.all([loadAvailability(selectedDate), loadMyBookings()]);
      setCancellingBookingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel booking');
      setCancellingBookingId(null);
    }
  };

  const monthTitle = monthCursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="book-session-page">
      <div className="book-session-glow book-session-glow-1" />
      <div className="book-session-glow book-session-glow-2" />

      <motion.section
        className="book-session-shell"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <aside className="booking-summary-panel">
          <div className="booking-logo">TWC</div>
          <p className="booking-brand">TWC Class Booking</p>
          <h2>{availability.session?.name || 'Workout Session'}</h2>

          <div className="booking-summary-meta">
            <span>
              <Clock size={15} />
              {availability.session?.durationMinutes || 45} min
            </span>
            <span>
              <CalendarDays size={15} />
              {selectedDatePretty}
            </span>
            <span>
              <MapPin size={15} />
              {availability.timezone}
            </span>
          </div>

          <p className="booking-summary-text">
            {availability.session?.description || 'Pick a date, choose an available slot, and confirm your booking.'}
          </p>

          <div className="booking-note">
            <ShieldCheck size={14} />
            Slots are confirmed instantly when seats are available.
          </div>

          {myBookings.length > 0 && (
            <div className="booking-history">
              <h4>Your Latest Bookings</h4>
              <ul>
                {myBookings.slice(0, 4).map((entry) => (
                  <li key={`${entry._id || entry.createdAt}-${entry.bookingDate}-${entry.slotTime}`}>
                    <div className="booking-item-info">
                      <div>
                        <strong>{entry.slotLabel || entry.slotTime}</strong>
                        <span>{formatHumanDate(entry.bookingDate)}</span>
                      </div>
                    </div>
                    {reschedulingBookingId !== entry._id && cancellingBookingId !== entry._id && (
                      <div className="booking-item-actions">
                        <button
                          type="button"
                          className="booking-action-btn booking-action-reschedule"
                          onClick={() => setReschedulingBookingId(entry._id)}
                          title="Reschedule this booking"
                        >
                          ✎ Reschedule
                        </button>
                        <button
                          type="button"
                          className="booking-action-btn booking-action-cancel"
                          onClick={() => onCancelBooking(entry._id)}
                          disabled={cancellingBookingId === entry._id}
                          title="Cancel this booking"
                        >
                          {cancellingBookingId === entry._id ? 'Cancelling...' : '✕ Cancel'}
                        </button>
                      </div>
                    )}
                    {reschedulingBookingId === entry._id && (
                      <div className="booking-reschedule-form">
                        <input
                          type="date"
                          value={rescheduleSelectedDate}
                          onChange={(e) => setRescheduleSelectedDate(e.target.value)}
                          className="booking-reschedule-input"
                        />
                        <button
                          type="button"
                          className="booking-confirm-btn"
                          disabled={!rescheduleSelectedDate}
                          onClick={() => {
                            // Show available slots for the new date
                            // For simplicity, we'll just ask for a time here
                            const newSlotTime = prompt('Enter new slot time (HH:mm):');
                            if (newSlotTime) {
                              onRescheduleBooking(entry._id, rescheduleSelectedDate, newSlotTime);
                            }
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="booking-cancel-btn"
                          onClick={() => {
                            setReschedulingBookingId(null);
                            setRescheduleSelectedDate('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="booking-calendar-panel">
          <h3>Select Date &amp; Time</h3>

          <div className="booking-month-head">
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <span>{monthTitle}</span>
            <button
              type="button"
              className="month-nav-btn"
              onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-grid-wrap">
            <div className="calendar-grid">
              {WEEKDAY_LABELS.map((day) => (
                <div className="weekday-cell" key={day}>{day}</div>
              ))}

              {daysInCalendar.map((date) => {
                const dayKey = formatDateKey(date);
                const isCurrentMonth = date.getMonth() === monthCursor.getMonth();
                const isSelected = dayKey === selectedDate;
                const isPast = dayKey < todayDateKey;

                return (
                  <button
                    type="button"
                    key={dayKey}
                    className={`calendar-day ${isCurrentMonth ? '' : 'outside'} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                    disabled={isPast}
                    onClick={() => setSelectedDate(dayKey)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="slot-column">
              {loadingSlots && <div className="slot-loading">Loading slots...</div>}

              {!loadingSlots && availability.slots.length === 0 && (
                <div className="slot-empty">No slots configured for this date.</div>
              )}

              {!loadingSlots && !availability.bookingEnabled && (
                <div className="slot-empty">{availability.blockedReason || 'Booking is unavailable for this date.'}</div>
              )}

              {!loadingSlots && availability.slots.map((slot) => (
                <button
                  type="button"
                  key={slot.time}
                  className={`slot-card ${slot.isAvailable ? 'available' : 'full'}`}
                  disabled={!slot.isAvailable || bookingSlotTime === slot.time || availability.isPastDate || !availability.bookingEnabled}
                  onClick={() => onBookSlot(slot.time)}
                >
                  <strong>{slot.label}</strong>
                  <span>{slot.remainingSeats} seats left</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default BookSession;
