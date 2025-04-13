import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-clients";
import { BookingType } from "../../../backend/src/shared/types";

interface Props {
    hotelId: string;
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
}

const CancelBookingModal = ({ hotelId, bookingId, isOpen, onClose }: Props) => {
    const [reason, setReason] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation(
        () => apiClient.cancelBooking(hotelId, bookingId, reason),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries("myBookings");
                onClose();
                // You can add a toast notification here
            },
            onError: (error: Error) => {
                // Handle error (e.g., show error toast)
                console.error(error.message);
            },
        }
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Cancel Booking</h2>
                <p className="text-gray-600 mb-4">
                    Please provide a reason for cancellation. Refunds are only processed for
                    cancellations made at least 48 hours before check-in.
                </p>
                <textarea
                    className="w-full h-32 border rounded p-2 mb-4"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter cancellation reason..."
                    required
                />
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        onClick={onClose}
                        disabled={mutation.isLoading}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                        onClick={() => mutation.mutate()}
                        disabled={!reason || mutation.isLoading}
                    >
                        {mutation.isLoading ? "Processing..." : "Confirm Cancellation"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelBookingModal;