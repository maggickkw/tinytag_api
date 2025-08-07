export const ensureValidISODate = (dateValue: any): string => {
  if (!dateValue) {
    return new Date().toISOString();
  }
  
  // If it's already a valid ISO string, return it
  if (typeof dateValue === 'string' && dateValue.length > 0) {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch {
      // Fall through to default
    }
  }
  
  // If it's a Date object
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue.toISOString();
  }
  
  // Default to current date if invalid
  return new Date().toISOString();
};