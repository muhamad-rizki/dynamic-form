export const AnotherHelper = '';

export const isEmpty = (obj) => {
  if (typeof obj === 'string') {
    return obj.trim() === '';
  }
  if (Array.isArray(obj)) {
    return obj.length <= 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length <= 0;
  }
  return obj === undefined || obj === null;
};
