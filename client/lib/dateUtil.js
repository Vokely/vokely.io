export default function formatBlogDate(isoString) {
    const date = new Date(isoString);
  
    if (isNaN(date)) {
      return 'Invalid date';
    }
  
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
export const addDays=(dateString, days = 30) =>{
  const date = new Date(dateString);

  if (isNaN(date)) {
    return 'Invalid date';
  }

  date.setDate(date.getDate() + days);
  return date.toISOString(); 
}

export const getTimeAgo = (timestamp) => {
  // Ensure the timestamp is treated as UTC by appending 'Z' if it's not already there
  const timestampUTC = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
  
  const modifiedAt = new Date(timestampUTC);
  const now = new Date();
  
  const diffInSeconds = Math.floor((now - modifiedAt) / 1000);
  
  if (diffInSeconds < 60) {
      return `Updated just now`;
  } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Updated ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Updated ${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Updated ${days} day${days > 1 ? "s" : ""} ago`;
  }
};

export const getDateDifference = (last_logged_at) => {
  const today = new Date();
  const lastLoggedDate = new Date(last_logged_at);   
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastDateOnly = new Date(lastLoggedDate.getFullYear(), lastLoggedDate.getMonth(), lastLoggedDate.getDate());
  const timeDifference = todayDateOnly - lastDateOnly;
  const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
  return daysDifference;
};

export const getBetweenDays = (startDate, endDate, unit = "months") => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end)) {
    return 0; // invalid dates
  }

  // Difference in milliseconds
  const diffInMs = end - start;

  if (unit === "days") {
    // Exclude end date
    return Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)) - 1);
  }

  if (unit === "months") {
    // Calculate months difference manually
    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // Adjust if the end day is before the start day
    if (end.getDate() < start.getDate()) {
      months -= 1;
    }

    return Math.max(0, months);
  }

  return 0; // fallback
};