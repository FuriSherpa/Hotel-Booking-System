import { BookingType, BookingStatus } from "../shared/types";
import Hotel from "../models/hotel";

const CANCELLATION_WINDOW_HOURS = 24;

export const validateCancellationEligibility = (
  booking: BookingType
): string | null => {
  // Check if booking is already cancelled or refunded
  if (booking.status !== BookingStatus.CONFIRMED) {
    return `Booking cannot be cancelled - current status: ${booking.status}`;
  }

  // Check cancellation window
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  const hoursUntilCheckIn =
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < CANCELLATION_WINDOW_HOURS) {
    return "Cancellation is only allowed up to 24 hours before check-in";
  }

  return null;
};

export const updateBookingStatus = async (
  hotelId: string,
  booking: BookingType
): Promise<boolean> => {
  if (
    booking.status === BookingStatus.CONFIRMED &&
    new Date(booking.checkOut) < new Date()
  ) {
    // Update booking status to COMPLETED
    const result = await Hotel.updateOne(
      {
        _id: hotelId,
        "bookings._id": booking._id,
      },
      {
        $set: {
          "bookings.$.status": BookingStatus.COMPLETED,
        },
      }
    );
    return result.modifiedCount > 0;
  }
  return false;
};
