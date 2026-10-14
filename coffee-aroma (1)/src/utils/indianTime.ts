// Utility for Indian Standard Time (IST - UTC+5:30) date, time, and currency formatting

/**
 * Returns the current date formatted in IST (DD/MM/YYYY or YYYY-MM-DD or DD MMM YYYY)
 */
export function getIndianDateTime(dateObj: Date = new Date()) {
  // Format in Asia/Kolkata timezone
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); // e.g. "10 Sep 2026"

  const isoDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj); // e.g. "2026-09-10"

  const timeStr = dateObj.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }); // e.g. "10:35:12 PM"

  const shortTimeStr = dateObj.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }); // e.g. "10:35 PM"

  return {
    dateFormatted: dateStr, // "10 Sep 2026"
    isoDate: isoDateStr,    // "2026-09-10"
    timeFormatted: shortTimeStr, // "10:35 PM"
    timeWithSeconds: timeStr,    // "10:35:12 PM"
    fullIndianStamp: `${dateStr} at ${shortTimeStr}`,
  };
}

/**
 * Formats an ISO string or date into Indian Standard Time formatted string
 */
export function formatToIndianTime(dateInput: string | Date | number): {
  date: string;
  time: string;
  full: string;
} {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      return { date: String(dateInput), time: '', full: String(dateInput) };
    }

    const date = d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const time = d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      date,
      time,
      full: `${date} • ${time} IST`,
    };
  } catch {
    return { date: String(dateInput), time: '', full: String(dateInput) };
  }
}
