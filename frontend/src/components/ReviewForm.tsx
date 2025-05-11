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
};

// Add this function to check if user can review
const canUserReview = (bookings: any[] | undefined) => {
    if (!bookings) return false;

    return bookings.some(booking =>
        booking.status === BookingStatus.COMPLETED &&
        new Date(booking.checkOut) < new Date()
    );
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
                showToast({ message: "Error submitting review", type: "error" });
            },
        }
    );

    // Fetch user's bookings
    const { data: myBookings } = useQuery(
        "fetchMyBookings",
        apiClient.fetchMyBookings,
    );

    const isEligibleToReview = canUserReview(
        myBookings?.find(hotel => hotel._id === hotelId)?.bookings
    );

    if (!isEligibleToReview) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800">
                    <span className="mr-2">ℹ️</span>
                    You can only review this hotel after completing your stay.
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 disabled:bg-gray-400"
                >
                    {isLoading ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;