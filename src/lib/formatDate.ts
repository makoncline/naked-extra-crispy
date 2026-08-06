const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
});

export const formatDate = (date: Date) => dateFormatter.format(date);
