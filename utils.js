const getWeekDates = (inputDate) => {
  const date = new Date(inputDate.split("T")[0]);
  const dayOfWeek = date.getDay();
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const expiredDate = new Date(currentDate);
    expiredDate.setDate(currentDate.getDate() + 1);
    return {
      availableAt: new Date(currentDate).toISOString(),
      redeemedAt: null,
      expiresAt: new Date(expiredDate).toISOString(),
    };
  });
};

module.exports = { getWeekDates };
