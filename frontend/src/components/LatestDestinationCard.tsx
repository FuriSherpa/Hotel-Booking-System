import { Link } from "react-router-dom";
import { HotelType } from "../../../backend/src/shared/types";
import { AiFillStar } from "react-icons/ai";

type Props = {
  hotel: HotelType;
};

const LatestDestinationCard = ({ hotel }: Props) => {
  return (
    <Link
      to={`/detail/${hotel._id}`}
      className="relative block group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all"
    >
      <div className="h-[300px] overflow-hidden">
        <img
          src={hotel.imageUrls[0]}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
          alt={hotel.name}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
        <div className="text-white">
          <div className="flex items-center mb-1">
            {Array.from({ length: hotel.starRating }).map((_, index) => (
              <AiFillStar key={index} className="fill-yellow-400" />
            ))}
          </div>
          <h3 className="text-xl font-bold">{hotel.name}</h3>
          <p className="text-sm opacity-90">{hotel.city}, {hotel.address}</p>
          <div className="mt-2">
            <span className="font-bold">NRs {hotel.pricePerNight}</span> per night
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LatestDestinationCard;
