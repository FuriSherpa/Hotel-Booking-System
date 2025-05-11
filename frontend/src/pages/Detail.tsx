import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "./../api-clients";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { useAppContext } from "../context/AppContext"; // Add this import

const Detail = () => {
    const { hotelId } = useParams();
    const { isLoggedIn } = useAppContext(); // Add this line to get login status

    // Updated query to include reviews
    const { data: hotel } = useQuery(
        ["fetchHotelById", hotelId], // Updated to array format for better cache management
        () => apiClient.fetchHotelById(hotelId || ""),
        {
            enabled: !!hotelId,
        }
    );

    if (!hotel) {
        return <></>;
    }

    return (
        <div className="space-y-6">
            <div>
                <span className="flex">
                    {Array.from({ length: hotel.starRating }).map((_, index) => (
                        <AiFillStar key={index} className="fill-yellow-400" />
                    ))}
                </span>
                <h1 className="text-3xl font-bold">{hotel.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {hotel.imageUrls.map((image, index) => (
                    <div key={index} className="h-[300px]">
                        <img
                            src={image}
                            alt={`${hotel.name} - Image ${index + 1}`}
                            className="rounded-md w-full h-full object-cover object-center"
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                {hotel.facilities.map((facility, index) => (
                    <div
                        key={index}
                        className="border border-slate-300 rounded-sm p-3"
                    >
                        {facility}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
                <div className="whitespace-pre-line">{hotel.description}</div>
                <div className="h-fit">
                    <GuestInfoForm
                        pricePerNight={hotel.pricePerNight}
                        hotelId={hotel._id}
                    />
                </div>
            </div>

            {/* Reviews section */}
            <div className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>

                {/* Show average rating at the top of reviews section */}
                <div className="flex items-center mb-6">
                    <span className="text-2xl font-bold mr-2">
                        {hotel.averageRating?.toFixed(1) || "No ratings yet"}
                    </span>
                    {hotel.averageRating > 0 && (
                        <AiFillStar className="text-2xl text-yellow-500" />
                    )}
                </div>

                {/* Show review form only for logged-in users */}
                {isLoggedIn ? (
                    <ReviewForm hotelId={hotelId || ""} />
                ) : (
                    <p className="text-gray-500 italic mb-4">
                        Please log in to leave a review
                    </p>
                )}

                {/* Display all reviews */}
                <ReviewList hotel={hotel} />
            </div>
        </div>
    );
};

export default Detail;