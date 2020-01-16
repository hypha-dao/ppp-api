class TimeUtil {

  static addMinutes(minutes, date = Date.now()) {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
  }

  static addDays(days, date = Date.now()) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

}

export default TimeUtil;  