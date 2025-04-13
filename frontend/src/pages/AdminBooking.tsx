import { useQuery, useMutation, useQueryClient } from "react-query";
import { useState } from "react";
import * as apiClient from "../api-clients";
import { BookingStatus, HotelType } from "../../../backend/src/shared/types";
import CancelBookingModal from "../components/CancelBookingModal";

const AdminBookings = () => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<{
        hotelId: string;
        bookingId: string;
    } | null>(null);

    const queryClient = useQueryClient();

    const { data: hotels, isLoading } = useQuery(
        "fetchAllBookings",
        apiClient.fetchAllBookings
    );

    const getStatusStyle = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'bg-green-100 text-green-800';
            case BookingStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            case BookingStatus.REFUNDED:
                return 'bg-blue-100 text-blue-800';
            case BookingStatus.REFUND_FAILED:
                return 'bg-orange-100 text-orange-800';
            case BookingStatus.REFUND_PENDING:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!hotels || hotels.length === 0) {
        return <span>No bookings found</span>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold">All Bookings</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left">Guest</th>
                            <th className="py-3 px-4 text-left">Hotel</th>
                            <th className="py-3 px-4 text-left">Check-in</th>
                            <th className="py-3 px-4 text-left">Check-out</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.map((hotel: HotelType) =>
                            hotel.bookings.map((booking) => (
                                <tr key={booking._id} className="border-b">
                                    <td className="py-2 px-4">
                                        {booking.firstName} {booking.lastName}
                                    </td>
                                    <td className="py-2 px-4">{hotel.name}</td>
                                    <td className="py-2 px-4">
                                        {new Date(booking.checkIn).toLocaleDateString()}
                                    </td>
                                    <td className="py-2 px-4">
                                        {new Date(booking.checkOut).toLocaleDateString()}
                                    </td>
                                    <td className="py-2 px-4">
                                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4">
                                        {booking.status === BookingStatus.CONFIRMED && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking({
                                                        hotelId: hotel._id,
                                                        bookingId: booking._id
                                                    });
                                                    setShowCancelModal(true);
                                                }}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <CancelBookingModal
                    hotelId={selectedBooking.hotelId}
                    bookingId={selectedBooking.bookingId}
                    isOpen={showCancelModal}
                    onClose={() => {
                        setShowCancelModal(false);
                        setSelectedBooking(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminBookings;