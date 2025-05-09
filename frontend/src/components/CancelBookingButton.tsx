import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import * as apiClient from "../api-clients";
import { BookingType } from "../../../backend/src/shared/types";
import { validateCancellationEligibility } from "../../../backend/src/utils/bookingUtils";

interface Props {
    booking: BookingType;
    hotelId: string;
}

const CancelBookingButton = ({ booking, hotelId }: Props) => {
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation(
        () => apiClient.cancelBooking(hotelId, booking._id, reason),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("fetchMyBookings");
                setShowModal(false);
                setReason("");

                // Show success message
                toast.success("Booking cancelled successfully", {
                    duration: 3000,
                });

                // Show refund message
                setTimeout(() => {
                    toast.custom(
                        (t) => (
                            <div
                                className={`${t.visible ? "animate-enter" : "animate-leave"
                                    } bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg`}
                            >
                                <p className="text-blue-800">
                                    <span className="mr-2">💰</span>
                                    {data.refundMessage}
                                </p>
                            </div>
                        ),
                        { duration: 3000 }
                    );
                }, 500);
            },
            onError: (error: Error) => {
                setShowModal(false);
                toast.error(error.message || "Failed to cancel booking");
                console.error("Cancellation error:", error);
            },
        }
    );

    // Check if booking can be cancelled
    const validationError = validateCancellationEligibility(booking);
    if (validationError) {
        return null; // Don't render the button if booking can't be cancelled
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Cancel Booking
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
                        <p className="mb-4">Are you sure you want to cancel this booking?</p>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation"
                            className="w-full border rounded-md p-2 mb-4 min-h-[100px]"
                            required
                        />

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setReason("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={mutation.isLoading}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => mutation.mutate()}
                                disabled={mutation.isLoading || !reason.trim()}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                            >
                                {mutation.isLoading ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CancelBookingButton;