import { useState } from "react";
import { useQuery } from "react-query";
import * as apiClient from "../api-clients";
import CancelBookingButton from "../components/CancelBookingButton";
import { getDisplayStatus, getStatusBadgeClass } from "../utils/bookingUtils";
import { BookingStatus } from "../../../backend/src/shared/types";

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState<BookingStatus>(BookingStatus.CONFIRMED);
    const [showAllBookings, setShowAllBookings] = useState<{ [key: string]: boolean }>({});
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [dateRange, setDateRange] = useState<'all' | 'month' | 'week'>('all');
    const [searchQuery, setSearchQuery] = useState("");

    const { data: hotels, isLoading } = useQuery(
        "fetchMyBookings",
        apiClient.fetchMyBookings
    );

    const tabs = [
        { status: BookingStatus.CONFIRMED, label: "Upcoming", icon: "📅" },
        { status: BookingStatus.COMPLETED, label: "Completed", icon: "✓" },
        { status: BookingStatus.CANCELLED, label: "Cancelled", icon: "✕" },
        { status: BookingStatus.REFUNDED, label: "Refunded", icon: "💰" }
    ];

    const filterBookingsByDate = (bookings: any[]) => {
        const today = new Date();
        switch (dateRange) {
            case 'week':
                const weekAgo = new Date(today.setDate(today.getDate() - 7));
                return bookings.filter(b => new Date(b.checkIn) >= weekAgo);
            case 'month':
                const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                return bookings.filter(b => new Date(b.checkIn) >= monthAgo);
            default:
                return bookings;
        }
    };

    const sortBookings = (bookings: any[]) => {
        return [...bookings].sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
            }
            return b.totalCost - a.totalCost;
        });
    };

    // Add search filter function
    const filterHotelsBySearch = (hotels: any[]) => {
        if (!searchQuery) return hotels;
        return hotels.filter(hotel =>
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.city.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Handle loading and empty states first
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!hotels || hotels.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🏨</div>
                <p className="text-gray-600 text-lg mb-2">No bookings found</p>
                <p className="text-gray-400">Your bookings will appear here</p>
            </div>
        );
    }

    const filteredHotels = hotels
        .map(hotel => ({
            ...hotel,
            bookings: hotel.bookings.filter(booking => {
                const checkOutDate = new Date(booking.checkOut);
                const today = new Date();

                switch (activeTab) {
                    case BookingStatus.COMPLETED:
                        return booking.status === BookingStatus.COMPLETED && checkOutDate < today;
                    case BookingStatus.CONFIRMED:
                        return booking.status === BookingStatus.CONFIRMED && checkOutDate >= today;
                    case BookingStatus.CANCELLED:
                        return booking.status === BookingStatus.REFUND_PENDING || booking.status === BookingStatus.CANCELLED;
                    case BookingStatus.REFUNDED:
                        return booking.status === BookingStatus.REFUNDED;
                    default:
                        return false;
                }
            })
        }))
        .filter(hotel => hotel.bookings.length > 0);

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
            <div className="bg-white rounded-lg shadow-sm p-6">

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search hotels by name or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute left-3 top-2.5">🔍</span>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.status}
                            onClick={() => setActiveTab(tab.status)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 
                                ${activeTab === tab.status
                                    ? "bg-blue-500 text-white shadow-md transform scale-105"
                                    : "cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <select
                        className="px-3 py-2 border rounded-lg text-sm"
                        onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                        value={sortBy}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                    </select>
                    <select
                        className="px-3 py-2 border rounded-lg text-sm"
                        onChange={(e) => setDateRange(e.target.value as 'all' | 'month' | 'week')}
                        value={dateRange}
                    >
                        <option value="all">All Time</option>
                        <option value="month">Last Month</option>
                        <option value="week">Last Week</option>
                    </select>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredHotels.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-4">🏨</div>
                        <p className="text-gray-600 text-lg mb-2">No {activeTab.toLowerCase()} bookings found</p>
                        <p className="text-gray-400">Your {activeTab.toLowerCase()} bookings will appear here</p>
                    </div>
                )}

                {/* Bookings Grid */}
                <div className="grid gap-6">
                    {filterHotelsBySearch(filteredHotels).map((hotel) => (
                        <div key={hotel._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
                                {/* Fixed height image container */}
                                <div className="relative h-[448px]">
                                    <img
                                        src={hotel.imageUrls[0]}
                                        className="absolute w-full h-full object-cover object-center"
                                        alt={hotel.name}
                                    />
                                    {hotel.imageUrls.length > 1 && (
                                        <button className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-1.5 text-sm font-medium">
                                            +{hotel.imageUrls.length - 1} photos
                                        </button>
                                    )}
                                </div>

                                {/* Content Container */}
                                <div className="p-6">
                                    {/* Hotel Header - Smaller text */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                                            <p className="text-sm text-gray-600 flex items-center mt-1">
                                                <span className="text-rose-500 mr-2">📍</span>
                                                {hotel.city}, {hotel.address}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-blue-600 text-sm">
                                            <span className="mr-1">★</span>
                                            <span>{hotel.starRating}</span>
                                        </div>
                                    </div>

                                    {/* Price and Amenities */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center text-gray-700">
                                            <span className="text-amber-500 mr-2">💰</span>
                                            Rs {hotel.pricePerNight}/night
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                        {hotel.description}
                                    </p>

                                    {/* Scrollable Bookings Container */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-base font-semibold">Booking Details</h4>
                                            {hotel.bookings.length > 1 && (
                                                <button
                                                    onClick={() => setShowAllBookings(prev => ({
                                                        ...prev,
                                                        [hotel._id]: !prev[hotel._id]
                                                    }))}
                                                    className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm font-medium"
                                                >
                                                    {showAllBookings[hotel._id] ? 'Show Less' : `View All (${hotel.bookings.length})`}
                                                </button>
                                            )}
                                        </div>

                                        <div className={`space-y-4 ${showAllBookings[hotel._id] ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
                                            {sortBookings(filterBookingsByDate(
                                                showAllBookings[hotel._id]
                                                    ? hotel.bookings
                                                    : [hotel.bookings[0]]
                                            )).map((booking, index) => (
                                                <div key={booking._id}
                                                    className={`${index > 0 ? 'border-t pt-4' : ''} text-sm`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                                            ${getStatusBadgeClass(booking.status)}`}>
                                                            {getDisplayStatus(booking.status)}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ID: {booking._id.slice(-8)}
                                                        </span>
                                                    </div>

                                                    {/* Booking Info Grid */}
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div>
                                                            <div className="text-sm text-gray-500 mb-1">Check-in</div>
                                                            <div className="flex items-center">
                                                                <span className="mr-2">📅</span>
                                                                {new Date(booking.checkIn).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500 mb-1">Check-out</div>
                                                            <div className="flex items-center">
                                                                <span className="mr-2">📅</span>
                                                                {new Date(booking.checkOut).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500 mb-1">Guests</div>
                                                            <div className="flex items-center">
                                                                <span className="mr-2">👥</span>
                                                                {booking.adultCount} adults, {booking.childCount} children
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                                                            <div className="flex items-center">
                                                                <span className="mr-2">💳</span>
                                                                Rs {booking.totalCost}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cancel Button */}
                                                    {booking.status === BookingStatus.CONFIRMED && (
                                                        <div className="mt-4">
                                                            <CancelBookingButton
                                                                booking={booking}
                                                                hotelId={hotel._id}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Cancellation Reason */}
                                                    {(booking.status === BookingStatus.CANCELLED ||
                                                        booking.status === BookingStatus.REFUNDED) &&
                                                        booking.cancellationReason && (
                                                            <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                                                                <span className="font-medium">Cancellation Reason: </span>
                                                                {booking.cancellationReason}
                                                            </div>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;