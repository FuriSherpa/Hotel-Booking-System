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
            onSuccess: () => {
                queryClient.invalidateQueries("fetchAllBookings");
                queryClient.invalidateQueries("myBookings");
                onClose();
            },
            onError: (error: Error) => {
                console.error(error.message);
                // You can add error handling here (e.g., show an error toast)
            },
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            mutation.mutate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cancellation Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded-md p-2 min-h-[100px]"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isLoading || !reason.trim()}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                        >
                            {mutation.isLoading ? "Cancelling..." : "Confirm Cancellation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelBookingModal;