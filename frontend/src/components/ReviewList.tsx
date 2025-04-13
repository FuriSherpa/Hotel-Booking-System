import { HotelType } from "../../../backend/src/shared/types";
import { AiFillStar } from "react-icons/ai";

type Props = {
    hotel: HotelType;
};

const ReviewList = ({ hotel }: Props) => {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
                Guest Reviews ({hotel.reviews.length})
            </h2>

            <div className="mb-4">
                <span className="text-xl font-bold">
                    {hotel.averageRating.toFixed(1)}
                </span>
                <span className="ml-1">
                    <AiFillStar className="inline text-yellow-500" />
                </span>
                <span className="ml-2 text-gray-500">
                    ({hotel.reviews.length} reviews)
                </span>
            </div>

            <div className="space-y-4">
                {hotel.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                            <span className="font-bold">{review.userName}</span>
                            <span className="ml-2 flex">
                                {[...Array(review.rating)].map((_, i) => (
                                    <AiFillStar key={i} className="text-yellow-500" />
                                ))}
                            </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;