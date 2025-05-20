import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import * as apiClient from '../api-clients';
import { FiUser, FiMail, FiPhone, FiHeart } from 'react-icons/fi';
import { format } from 'date-fns';
import { BookingStatus } from '../../../backend/src/shared/types';

const UserDetails = () => {
    const { userId } = useParams();

    const { data: user, isLoading: isLoadingUser } = useQuery(
        ['user', userId],
        () => apiClient.fetchUserById(userId || '')
    );

    const { data: userBookings, isLoading: isLoadingBookings } = useQuery(
        ['userBookings', userId],
        () => apiClient.fetchUserBookings(userId || '')
    );

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
                {userBookings && userBookings.length > 0 ? (
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
                                {userBookings.map((booking) => (
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
                                                    'bg-red-100 text-red-800'
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
                ) : (
                    <p className="text-gray-500 text-center py-4">No booking history found</p>
                )}
            </div>
        </div>
    );
};

export default UserDetails;