import { HotelType, RoomAvailability } from "../shared/types";

export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const checkRoomAvailability = async (
  hotel: HotelType,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> => {
  const dates = getDatesInRange(checkIn, checkOut);

  for (const date of dates) {
    const dateStr = date.toISOString().split("T")[0];
    const availability = hotel.roomAvailability.find((r) => r.date === dateStr);

    // If no availability record exists, all rooms are available
    const availableRooms = availability
      ? availability.availableRooms
      : hotel.totalRooms;

    if (availableRooms <= 0) {
      return false;
    }
  }

  return true;
};

export const updateRoomAvailability = async (
  hotel: HotelType,
  checkIn: Date,
  checkOut: Date,
  isBooking: boolean = true
): Promise<void> => {
  const dates = getDatesInRange(checkIn, checkOut);

  dates.forEach((date) => {
    const dateStr = date.toISOString().split("T")[0];
    const availabilityIndex = hotel.roomAvailability.findIndex(
      (r) => r.date === dateStr
    );

    if (availabilityIndex === -1) {
      // Create new availability record
      hotel.roomAvailability.push({
        date: dateStr,
        availableRooms: hotel.totalRooms - (isBooking ? 1 : 0),
      });
    } else {
      // Update existing availability record
      hotel.roomAvailability[availabilityIndex].availableRooms += isBooking
        ? -1
        : 1;
    }
  });
};
