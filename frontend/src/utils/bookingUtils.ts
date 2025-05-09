import { BookingStatus } from "../../../backend/src/shared/types";

export const getDisplayStatus = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.REFUND_PENDING:
      return "CANCELLED";
    default:
      return status;
  }
};

export const getStatusBadgeClass = (status: BookingStatus): string => {
  const displayStatus = getDisplayStatus(status);
  switch (displayStatus) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
