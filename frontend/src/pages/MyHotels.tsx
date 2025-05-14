import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom"
import * as apiClient from "../api-clients"
import { BsMap } from "react-icons/bs"
import { BiHotel, BiMoney, BiStar } from "react-icons/bi"
import { FaTrash } from "react-icons/fa"
import { useAppContext } from "../context/AppContext";
import { useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";

const MyHotels = () => {
    const { userRole } = useAppContext();
    const { showToast } = useAppContext();
    const [deletingHotelId, setDeletingHotelId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hotelToDelete, setHotelToDelete] = useState<{ id: string, name: string } | null>(null);
    const queryClient = useQueryClient();

    // Use different query based on user role
    const { data: hotelData } = useQuery(
        "fetchHotels",
        userRole === "admin" ? apiClient.fetchHotels : apiClient.fetchMyHotels,
        {
            onError: () => { },
        }
    );

    const deleteMutation = useMutation(apiClient.deleteHotel, {
        onSuccess: () => {
            showToast({ message: "Hotel deleted successfully", type: "success" });
            queryClient.invalidateQueries("fetchHotels");
        },
        onError: (error: Error) => {
            showToast({ message: error.message || "Error deleting hotel", type: "error" });
        },
        onSettled: () => {
            setDeletingHotelId(null);
        }
    });

    const handleDeleteClick = (hotelId: string, hotelName: string) => {
        setHotelToDelete({ id: hotelId, name: hotelName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (hotelToDelete) {
            setDeletingHotelId(hotelToDelete.id);
            deleteMutation.mutate(hotelToDelete.id);
        }
    };

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
                    <div key={hotel._id} className="flex flex-col justify-between border border-slate-300 rounded-lg p-8 gap-5">
                        <h2 className="text-2xl font-bold">{hotel.name}</h2>
                        <div className="whitespace-pre-line">{hotel.description}</div>
                        <div className="grid grid-cols-5 gap-2">
                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BsMap className="mr-1" />
                                {hotel.address}, {hotel.city}
                            </div>

                            <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                                <BiMoney className="mr-1" />
                                Rs {hotel.pricePerNight} per night
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
                        <span className="flex justify-end gap-2">
                            <Link
                                to={`/edit-hotel/${hotel._id}`}
                                className="flex bg-blue-500 text-white text-xl font-bold p-2 hover:bg-blue-400">
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDeleteClick(hotel._id, hotel.name)}
                                disabled={deletingHotelId === hotel._id}
                                className={`flex items-center gap-2 text-white text-xl font-bold p-2 
                                    ${deletingHotelId === hotel._id
                                        ? 'bg-red-300 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-400'}`}>
                                {/* <FaTrash className="w-5 h-5" /> */}
                                {deletingHotelId === hotel._id ? 'Deleting...' : 'Delete'}
                            </button>
                        </span>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setHotelToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Hotel"
                message={`Are you sure you want to delete ${hotelToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
};

export default MyHotels;