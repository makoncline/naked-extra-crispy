export function convertMetersToMiles(meters: number): number {
  return meters / 1609.344;
}

function convertMetersToFeet(meters: number): number {
  return meters * 3.28084;
}

export function formatDistance(meters: number): string {
  const miles = convertMetersToMiles(meters);
  const noDecimalFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  });
  const oneDecimalFormatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  });
  if (miles < 0.1) {
    const feet = convertMetersToFeet(meters);
    return `${noDecimalFormatter.format(feet)} ft`;
  } else if (miles < 5) {
    return `${oneDecimalFormatter.format(miles)} mi`;
  } else {
    return `${noDecimalFormatter.format(miles)} mi`;
  }
}
