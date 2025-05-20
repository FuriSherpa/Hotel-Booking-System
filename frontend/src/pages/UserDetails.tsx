import { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import * as apiClient from '../api-clients';
import { FiUser, FiMail, FiPhone, FiHeart, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { BookingStatus } from '../../../backend/src/shared/types';
import Pagination from '../components/Pagination';

interface BookingType {
    _id: string;
    hotelName: string;
    hotelCity: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalCost: number;
}

const UserDetails = () => {
    const { userId } = useParams();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const itemsPerPage = 10;

    const { data: user, isLoading: isLoadingUser } = useQuery(
        ['user', userId],
        () => apiClient.fetchUserById(userId || '')
    );

    const { data: userBookings, isLoading: isLoadingBookings } = useQuery(
        ['userBookings', userId],
        () => apiClient.fetchUserBookings(userId || '')
    );

    const filteredBookings = userBookings?.filter(booking => {
        const matchesSearch = booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.hotelCity.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedBookings = filteredBookings?.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalPages = Math.ceil((filteredBookings?.length || 0) / itemsPerPage);

    if (isLoadingUser || isLoadingBookings) {
        return <div className="text-center p-6">Loading...</div>;
    }

    if (!user) {
        return <div className="text-center p-6">User not found</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">User Details</h1>

            {/* User Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FiUser className="text-gray-400 w-5 h-5" />
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FiMail className="text-gray-400 w-5 h-5" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <FiPhone className="text-gray-400 w-5 h-5" />
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium">{user.phoneNumber || "Not provided"}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FiHeart className="text-gray-400 w-5 h-5" />
                            <div>
                                <p className="text-sm text-gray-500">Wishlist Items</p>
                                <p className="font-medium">{user.wishlist?.length || 0} hotels</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking History Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">Booking History</h2>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by hotel name or city..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to first page on search
                                }}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1); // Reset to first page on filter change
                            }}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                            <option value={BookingStatus.COMPLETED}>Completed</option>
                            <option value={BookingStatus.REFUND_PENDING}>Refund Pending</option>
                            <option value={BookingStatus.REFUNDED}>Refunded</option>
                        </select>
                    </div>
                </div>

                {userBookings && userBookings.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedBookings?.map((booking) => (
                                        <tr key={booking._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{booking.hotelName}</div>
                                                    <div className="text-sm text-gray-500">{booking.hotelCity}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-800' :
                                                    booking.status === BookingStatus.COMPLETED ? 'bg-blue-100 text-blue-800' :
                                                        booking.status === BookingStatus.REFUND_PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === BookingStatus.REFUNDED ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                Rs {booking.totalCost.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination
                                page={page}
                                pages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-center py-4">
                        {searchTerm || statusFilter !== 'ALL'
                            ? 'No bookings found matching your criteria'
                            : 'No booking history found'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserDetails;