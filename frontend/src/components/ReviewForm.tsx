import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAppContext } from "../context/AppContext";
import * as apiClient from "../api-clients";
import { BookingStatus } from "../../../backend/src/shared/types";

type Props = {
    hotelId: string;
};

type ReviewFormData = {
    rating: number;
    comment: string;
    bookingId: string;
};

const ReviewForm = ({ hotelId }: Props) => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormData>();

    const { mutate, isLoading } = useMutation(
        (data: ReviewFormData) => apiClient.submitReview(hotelId, data),
        {
            onSuccess: () => {
                showToast({ message: "Review submitted successfully!", type: "success" });
                queryClient.invalidateQueries(["fetchHotelById", hotelId]);
                reset();
            },
            onError: () => {
                showToast({ message: "Cannot Review More Than Once Per Booking", type: "error" });
            },
        }
    );

    // Fetch user's bookings
    const { data: myBookings } = useQuery(
        "fetchMyBookings",
        apiClient.fetchMyBookings,
    );

    // Get eligible bookings (completed, past checkout date, and not yet reviewed)
    const eligibleBookings = myBookings?.find(hotel => hotel._id === hotelId)?.bookings?.filter(booking => {
        const isCompleted = booking.status === "COMPLETED";
        const isPastCheckout = new Date(booking.checkOut) < new Date();
        const hasNoReview = !booking.reviewed;
        return isCompleted && isPastCheckout && hasNoReview;
    }) || [];

    if (eligibleBookings.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800">
                    <span className="mr-2">ℹ️</span>
                    No eligible bookings found to review.
                </p>
            </div>
        );
    }

    const onSubmit = handleSubmit((data) => {
        mutate(data);
    });

    return (
        <form onSubmit={onSubmit} className="mt-4">
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Select Booking</label>
                    <select
                        {...register("bookingId", { required: "Please select a booking" })}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="">Select a booking</option>
                        {eligibleBookings.map((booking) => (
                            <option key={booking._id} value={booking._id}>
                                Stay: {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                    {errors.bookingId && (
                        <span className="text-red-500 text-sm">{errors.bookingId.message}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Rating</label>
                    <select
                        {...register("rating", { required: "Rating is required" })}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Rating</option>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>{num} Stars</option>
                        ))}
                    </select>
                    {errors.rating && (
                        <span className="text-red-500 text-sm">{errors.rating.message}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Comment</label>
                    <textarea
                        {...register("comment", { required: "Comment is required" })}
                        rows={4}
                        className="w-full p-2 border rounded"
                        placeholder="Share your experience..."
                    />
                    {errors.comment && (
                        <span className="text-red-500 text-sm">{errors.comment.message}</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-500 disabled:bg-gray-400"
                >
                    {isLoading ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;