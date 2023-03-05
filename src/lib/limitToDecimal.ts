export const limitToOneDecimal = (num: number, limit = 1): number => {
  if (num % 1 !== 0) {
    return parseFloat(num.toFixed(limit));
  }
  return num;
};
