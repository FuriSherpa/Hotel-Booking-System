import { useQuery } from "react-query";
import * as apiClient from "../api-clients";
import CancelBookingButton from "../components/CancelBookingButton";
import { getDisplayStatus, getStatusBadgeClass } from "../utils/bookingUtils";
import { BookingStatus } from "../../../backend/src/shared/types";

const MyBookings = () => {
    const { data: hotels } = useQuery(
        "fetchMyBookings",
        apiClient.fetchMyBookings
    );

    if (!hotels || hotels.length === 0) {
        return <span>No bookings found</span>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            {hotels.map((hotel) => (
                <div key={hotel._id} className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] border border-slate-300 rounded-lg p-8 gap-5">
                    <div className="lg:w-full lg:h-[250px]">
                        <img
                            src={hotel.imageUrls[0]}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="text-2xl font-bold">
                            {hotel.name}
                            <div className="text-xs font-normal">
                                {hotel.city}, {hotel.address}
                            </div>
                        </div>
                        {hotel.bookings.map((booking) => (
                            <div key={booking._id} className="border-b pb-4">
                                <div>
                                    <span className="font-bold mr-2">Dates: </span>
                                    <span>
                                        {new Date(booking.checkIn).toDateString()} -
                                        {new Date(booking.checkOut).toDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold mr-2">Guests:</span>
                                    <span>
                                        {booking.adultCount} adults, {booking.childCount} children
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusBadgeClass(booking.status)}`}>
                                        {getDisplayStatus(booking.status)}
                                    </span>
                                </div>
                                {booking.status === BookingStatus.CONFIRMED && (
                                    <div className="mt-4">
                                        <CancelBookingButton
                                            booking={booking}
                                            hotelId={hotel._id}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyBookings;