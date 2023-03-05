export const getRatingDescription = (rating: number): string => {
  const roundedRating = Math.round(rating);
  switch (roundedRating) {
    case 1:
      return "💩";
    case 2:
      return "Bad";
    case 3:
      return "Not good";
    case 4:
      return "Could have been better";
    case 5:
      return "OK";
    case 6:
      return "Good";
    case 7:
      return "it's a 7";
    case 8:
      return "Great";
    case 9:
      return "OMG";
    case 10:
      return "Will never have better";
    default:
      return "";
  }
};
