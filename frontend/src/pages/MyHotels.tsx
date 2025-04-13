import { useQuery } from "react-query";
import { Link } from "react-router-dom"
import * as apiClient from "../api-clients"
import { BsMap } from "react-icons/bs"
import { BiHotel, BiMoney, BiStar } from "react-icons/bi"
import { useAppContext } from "../context/AppContext";

const MyHotels = () => {
    const { userRole } = useAppContext();

    // Use different query based on user role
    const { data: hotelData } = useQuery(
        "fetchHotels",
        userRole === "admin" ? apiClient.fetchHotels : apiClient.fetchMyHotels,
        {
            onError: () => { },
        }
    );

    if (!hotelData) {
        return <span>No Hotels Found</span>
    }

    return (
        <div className="space-y-5">
            <span className="flex justify-between">
                <h1 className="text-3xl font-bold">
                    {userRole === "admin" ? "All Hotels" : "My Hotels"}
                </h1>
                <Link
                    to="/add-hotel"
                    className="flex bg-blue-600 text-white text-xl font-bold p-2 hover:bg-blue-500">
                    Add Hotel
                </Link>
            </span>

            <div className="grid grid-cols-1 gap-8">
                {hotelData.map((hotel) => (
                    <div key={hotel._id} className="flex flex-col justify-between border border-slate-300 rounder-lg p-8 gap-5">
                        <h2 className="text-2xl font-bold">{hotel.name}</h2>
                        <div className="whitespace-pre-line">{hotel.description}</div>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BsMap className="mr-1" />
                                {hotel.address}, {hotel.city}
                            </div>

                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BiMoney className="mr-1" />
                                {hotel.pricePerNight} per night
                            </div>

                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BiHotel className="mr-1" />
                                {hotel.adultCount} adults, {hotel.childCount} children
                            </div>

                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BiStar className="mr-1" />
                                {hotel.starRating} Star Rating
                            </div>
                        </div>
                        <span className="flex justify-end">
                            <Link to={`/edit-hotel/${hotel._id}`}
                                className="flex bg-blue-500 text-white text-xl font-bold p-2 hover:bg-blue-400">
                                View Details
                            </Link>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyHotels;