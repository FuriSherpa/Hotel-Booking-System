import { useQuery, useMutation, useQueryClient } from "react-query";
import { Link } from "react-router-dom"
import * as apiClient from "../api-clients"
import { BsMap, BsImages } from "react-icons/bs"
import { BiHotel, BiMoney, BiStar } from "react-icons/bi"
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa"
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
        return (
            <div className="flex items-center justify-center h-64">
                <span className="text-gray-500 text-xl">No Hotels Found</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">
                        {userRole === "admin" ? "All Hotels" : "My Hotels"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Managing {hotelData.length} hotel{hotelData.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    to="/add-hotel"
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <FaPlus />
                    <span>Add New Hotel</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotelData.map((hotel) => (
                    <div
                        key={hotel._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        {hotel.imageUrls && hotel.imageUrls[0] && (
                            <div className="relative h-48 rounded-t-xl overflow-hidden">
                                <img
                                    src={hotel.imageUrls[0]}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                                    <BsImages />
                                    <span>{hotel.imageUrls.length}</span>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">{hotel.name}</h2>
                                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                    <BiStar className="text-yellow-500" />
                                    <span className="font-semibold">{hotel.starRating}</span>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center text-gray-600">
                                    <BsMap className="mr-2 text-gray-400" />
                                    <span className="truncate">{hotel.city}, {hotel.address}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <BiMoney className="mr-2 text-gray-400" />
                                    <span className="font-semibold">Rs {hotel.pricePerNight}</span>/night
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <BiHotel className="mr-2 text-gray-400" />
                                    <span>{hotel.adultCount} adults, {hotel.childCount} children</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    to={`/edit-hotel/${hotel._id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <FaEdit />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(hotel._id, hotel.name)}
                                    disabled={deletingHotelId === hotel._id}
                                    className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg transition-colors
                                        ${deletingHotelId === hotel._id
                                            ? 'bg-red-100 text-red-300 cursor-not-allowed'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                                    <FaTrash />
                                    {deletingHotelId === hotel._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
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