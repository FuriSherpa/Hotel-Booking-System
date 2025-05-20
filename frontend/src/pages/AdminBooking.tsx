import React from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useState } from "react";
import * as apiClient from "../api-clients";
import { BookingStatus, HotelType } from "../../../backend/src/shared/types";
import CancelBookingModal from "../components/CancelBookingModal";
import ConfirmationModal from '../components/ConfirmationModal1';
import { FaSearch, FaDownload, FaMapMarkerAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CSVLink } from "react-csv";
import { toast } from "react-hot-toast";

const AdminBookings: React.FC = () => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<{
        hotelId: string;
        bookingId: string;
    } | null>(null);
    const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

    // New state variables
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">("ALL");
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [sortBy, setSortBy] = useState<"date" | "status" | "amount">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [hotelSearchQuery, setHotelSearchQuery] = useState(""); // <-- New state for hotel search
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<{
        hotelId: string;
        bookingId: string;
        status: BookingStatus;
        actionType: 'cancel' | 'refund';
    } | null>(null);

    const queryClient = useQueryClient();

    const { data: hotels, isLoading } = useQuery(
        "fetchAllBookings",
        apiClient.fetchAllBookings
    );

    const { mutate: updateStatus } = useMutation(
        ({ hotelId, bookingId, status }: { hotelId: string; bookingId: string; status: BookingStatus }) =>
            apiClient.updateBookingStatus(hotelId, bookingId, status),
        {
            onSuccess: () => {
                toast.success("Booking status updated successfully");
                // Refresh the bookings data
                queryClient.invalidateQueries("fetchAllBookings");
            },
            onError: () => {
                toast.error("Failed to update booking status");
            },
        }
    );

    const getStatusStyle = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'bg-green-100 text-green-800';
            case BookingStatus.REFUNDED:
                return 'bg-blue-100 text-blue-800';
            case BookingStatus.REFUND_PENDING:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filterAndSortBookings = () => {
        if (!hotels) return [];

        let filteredHotels = [...hotels];

        // Apply search filter
        if (searchQuery) {
            filteredHotels = filteredHotels.filter(hotel =>
                hotel.bookings.some(booking =>
                    `${booking.firstName} ${booking.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply status filter
        if (statusFilter !== "ALL") {
            filteredHotels = filteredHotels.map(hotel => ({
                ...hotel,
                bookings: hotel.bookings.filter(booking => booking.status === statusFilter)
            })).filter(hotel => hotel.bookings.length > 0);
        }

        // Apply date range filter
        if (dateRange[0] && dateRange[1]) {
            filteredHotels = filteredHotels.map(hotel => ({
                ...hotel,
                bookings: hotel.bookings.filter(booking => {
                    const bookingDate = new Date(booking.checkIn);
                    return bookingDate >= dateRange[0]! && bookingDate <= dateRange[1]!;
                })
            })).filter(hotel => hotel.bookings.length > 0);
        }

        // Get all bookings across all hotels
        let allBookings: Array<{ booking: any; hotel: any }> = [];
        filteredHotels.forEach(hotel => {
            hotel.bookings.forEach(booking => {
                allBookings.push({ booking, hotel });
            });
        });

        // Sort all bookings
        allBookings.sort((a, b) => {
            switch (sortBy) {
                case "date":
                    const dateA = new Date(a.booking.checkIn).getTime();
                    const dateB = new Date(b.booking.checkIn).getTime();
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;

                case "amount":
                    const amountA = Number(a.booking.totalCost);
                    const amountB = Number(b.booking.totalCost);
                    return sortOrder === "asc" ? amountA - amountB : amountB - amountA;

                default:
                    return 0;
            }
        });

        // Group bookings back by hotel
        const sortedHotels = hotels.map(hotel => ({
            ...hotel,
            bookings: allBookings
                .filter(item => item.hotel._id === hotel._id)
                .map(item => item.booking)
        })).filter(hotel => hotel.bookings.length > 0);

        return sortedHotels;
    };

    // New function to filter hotels
    const filterHotels = () => {
        if (!hotels) return [];
        return hotels.filter(hotel =>
            hotel.name.toLowerCase().includes(hotelSearchQuery.toLowerCase()) ||
            hotel.city.toLowerCase().includes(hotelSearchQuery.toLowerCase())
        );
    };

    const prepareCSVData = () => {
        const csvData = [];

        // Push headers
        csvData.push(['Guest Name', 'Hotel', 'Check-in', 'Check-out', 'Status', 'Total Amount']);

        // Get filtered bookings
        const filteredHotels = filterAndSortBookings();

        if (selectedHotel) {
            // Export only selected hotel's filtered bookings
            const hotel = filteredHotels.find(h => h._id === selectedHotel);
            if (hotel) {
                hotel.bookings.forEach(booking => {
                    csvData.push([
                        `${booking.firstName} ${booking.lastName}`,
                        hotel.name,
                        new Date(booking.checkIn).toLocaleDateString(),
                        new Date(booking.checkOut).toLocaleDateString(),
                        booking.status,
                        `Rs ${booking.totalCost}`
                    ]);
                });
            }
        } else {
            // Export all filtered bookings
            filteredHotels.forEach(hotel => {
                hotel.bookings.forEach(booking => {
                    csvData.push([
                        `${booking.firstName} ${booking.lastName}`,
                        hotel.name,
                        new Date(booking.checkIn).toLocaleDateString(),
                        new Date(booking.checkOut).toLocaleDateString(),
                        booking.status,
                        `Rs ${booking.totalCost}`
                    ]);
                });
            });
        }

        return csvData;
    };

    // Function to generate descriptive filename
    const getExportFileName = () => {
        const parts = [];

        // Add basic prefix
        parts.push('bookings');

        // Add hotel name if selected
        if (selectedHotel) {
            const hotel = hotels?.find(h => h._id === selectedHotel);
            if (hotel) {
                parts.push(hotel.name.toLowerCase().replace(/\s+/g, '-'));
            }
        }

        // Add search query if present
        if (searchQuery) {
            parts.push(`guest-${searchQuery.toLowerCase().replace(/\s+/g, '-')}`);
        }

        // Add status if filtered
        if (statusFilter !== "ALL") {
            parts.push(statusFilter.toLowerCase());
        }

        // Add date range if present
        if (dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].toISOString().split('T')[0];
            const endDate = dateRange[1].toISOString().split('T')[0];
            parts.push(`${startDate}-to-${endDate}`);
        }

        // Add timestamp
        parts.push(new Date().toISOString().split('T')[0]);

        return parts.join('_') + '.csv';
    };

    const handleStatusUpdate = (hotelId: string, bookingId: string, status: BookingStatus, actionType: 'cancel' | 'refund') => {
        setConfirmationAction({ hotelId, bookingId, status, actionType });
        setShowConfirmationModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    {selectedHotel ? 'Hotel Bookings' : 'Hotels Overview'}
                </h1>
                {selectedHotel && (
                    <button
                        onClick={() => setSelectedHotel(null)}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                        ← Back to Hotels
                    </button>
                )}
                <CSVLink
                    data={prepareCSVData()}
                    filename={getExportFileName()}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                    <FaDownload />
                    {`Export ${searchQuery || statusFilter !== "ALL" || (dateRange[0] && dateRange[1]) ? 'Filtered' : selectedHotel ? 'Hotel' : 'All'} Bookings`}
                </CSVLink>
            </div>

            {!selectedHotel ? (
                <>
                    {/* Hotel Search Bar */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search hotels by name or city..."
                                value={hotelSearchQuery}
                                onChange={(e) => setHotelSearchQuery(e.target.value)}
                                className="pl-10 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Hotels Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filterHotels().map((hotel) => {
                            // Calculate metrics
                            const confirmedBookings = hotel.bookings.filter(b => b.status === BookingStatus.CONFIRMED).length;
                            const completedBookings = hotel.bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
                            const cancelledBookings = hotel.bookings.filter(b =>
                                b.status === BookingStatus.REFUNDED || b.status === BookingStatus.REFUND_PENDING
                            ).length;
                            const revenue = hotel.bookings
                                .filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
                                .reduce((sum, b) => sum + Number(b.totalCost), 0);

                            return (
                                <div
                                    key={hotel._id}
                                    onClick={() => setSelectedHotel(hotel._id)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        {/* Header Section - Fixed Height */}
                                        <div className="mb-6 min-h-[80px]">
                                            <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">{hotel.name}</h3>
                                            <p className="text-gray-500 mt-1 flex items-center">
                                                <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                                                <span className="truncate">{hotel.city}</span>
                                            </p>
                                        </div>

                                        {/* Stats Grid - Fixed Layout */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-sm text-blue-600 font-medium mb-1">Total Bookings</p>
                                                <p className="text-2xl font-bold text-blue-700">{hotel.bookings.length}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm text-green-600 font-medium mb-1">Revenue</p>
                                                <p className="text-2xl font-bold text-green-700">₹{revenue.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Status List - Consistent Spacing */}
                                        <div className="space-y-3 flex-grow">
                                            <div className="flex items-center justify-between h-8">
                                                <span className="text-gray-600 w-24">Active</span>
                                                <div className="flex items-center justify-end flex-grow">
                                                    <span className="font-semibold text-gray-900 mr-2">{confirmedBookings}</span>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(BookingStatus.CONFIRMED)}`}>
                                                        CONFIRMED
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between h-8">
                                                <span className="text-gray-600 w-24">Completed</span>
                                                <div className="flex items-center justify-end flex-grow">
                                                    <span className="font-semibold text-gray-900 mr-2">{completedBookings}</span>
                                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                                        COMPLETED
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between h-8">
                                                <span className="text-gray-600 w-24">Cancelled</span>
                                                <div className="flex items-center justify-end flex-grow">
                                                    <span className="font-semibold text-gray-900 mr-2">{cancelledBookings}</span>
                                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                        CANCELLED
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                // Selected Hotel Bookings View
                <>
                    {/* Filters Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search guest"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "ALL")}
                                className="p-2 border rounded-lg"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value={BookingStatus.COMPLETED}>Completed</option>
                                <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                                <option value={BookingStatus.REFUNDED}>Refunded</option>
                                <option value={BookingStatus.REFUND_PENDING}>Refund Pending</option>
                            </select>

                            {/* Date Range Picker */}
                            <div className="flex gap-2">
                                <DatePicker
                                    selected={dateRange[0]}
                                    onChange={(date) => setDateRange([date, dateRange[1]])}
                                    placeholderText="Start Date"
                                    className="p-2 border rounded-lg w-full"
                                />
                                <DatePicker
                                    selected={dateRange[1]}
                                    onChange={(date) => setDateRange([dateRange[0], date])}
                                    placeholderText="End Date"
                                    className="p-2 border rounded-lg w-full"
                                />
                            </div>

                            {/* Sort Options */}
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy as "date" | "status" | "amount");
                                    setSortOrder(newSortOrder as "asc" | "desc");
                                }}
                                className="p-2 border rounded-lg"
                            >
                                <option value="date-desc">Latest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Amount: High to Low</option>
                                <option value="amount-asc">Amount: Low to High</option>
                            </select>
                        </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filterAndSortBookings()
                                        .filter(hotel => hotel._id === selectedHotel)
                                        .map((hotel: HotelType) =>
                                            hotel.bookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.firstName} {booking.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{booking.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{hotel.name}</div>
                                                        <div className="text-sm text-gray-500">{hotel.city}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.checkIn).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.checkOut).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        Rs {booking.totalCost.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {booking.status === BookingStatus.CONFIRMED && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(
                                                                    hotel._id,
                                                                    booking._id,
                                                                    BookingStatus.REFUND_PENDING,
                                                                    'cancel'
                                                                )}
                                                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        {booking.status === BookingStatus.REFUND_PENDING && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(
                                                                    hotel._id,
                                                                    booking._id,
                                                                    BookingStatus.REFUNDED,
                                                                    'refund'
                                                                )}
                                                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                            >
                                                                Refund
                                                            </button>
                                                        )}
                                                        {(booking.status === BookingStatus.COMPLETED ||
                                                            booking.status === BookingStatus.REFUNDED) && (
                                                                <span className="text-gray-400">No actions available</span>
                                                            )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {selectedBooking && (
                <CancelBookingModal
                    hotelId={selectedBooking.hotelId}
                    bookingId={selectedBooking.bookingId}
                    isOpen={showCancelModal}
                    onClose={() => {
                        setShowCancelModal(false);
                        setSelectedBooking(null);
                    }}
                />
            )}
            {showConfirmationModal && confirmationAction && (
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={() => {
                        setShowConfirmationModal(false);
                        setConfirmationAction(null);
                    }}
                    onConfirm={() => {
                        updateStatus({
                            hotelId: confirmationAction.hotelId,
                            bookingId: confirmationAction.bookingId,
                            status: confirmationAction.status
                        });
                    }}
                    title={`Confirm ${confirmationAction.actionType === 'cancel' ? 'Cancellation' : 'Refund'}`}
                    message={`Are you sure you want to ${confirmationAction.actionType === 'cancel' ?
                        'cancel this booking' :
                        'process the refund for this booking'
                        }?`}
                    confirmText={confirmationAction.actionType === 'cancel' ? 'Cancel Booking' : 'Process Refund'}
                />
            )}
        </div>
    );
};

export default AdminBookings;