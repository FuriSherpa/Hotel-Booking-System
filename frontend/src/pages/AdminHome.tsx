import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import * as apiClient from '../api-clients';
import { FaChartLine, FaBook, FaBuilding, FaHotel } from 'react-icons/fa';

const AdminHome = () => {
    const { data: analyticsData } = useQuery(
        ["analytics", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
        () => apiClient.fetchAnalytics({
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date()
        })
    );

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-900">Welcome, Admin</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Bookings</p>
                            <h3 className="text-2xl font-bold">
                                {analyticsData?.totalBookings || 0}
                            </h3>
                        </div>
                        <FaBook className="text-3xl text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold">
                                Rs {analyticsData?.totalRevenue.toFixed(2) || '0.00'}
                            </h3>
                        </div>
                        <FaChartLine className="text-3xl text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Hotels</p>
                            <h3 className="text-2xl font-bold">
                                {analyticsData?.topHotels.length || 0}
                            </h3>
                        </div>
                        <FaHotel className="text-3xl text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/dashboard"
                    className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl shadow-md transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <FaChartLine className="text-3xl" />
                        <div>
                            <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                            <p className="text-sm opacity-90">View detailed statistics</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/bookings"
                    className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl shadow-md transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <FaBook className="text-3xl" />
                        <div>
                            <h3 className="text-xl font-semibold">Manage Bookings</h3>
                            <p className="text-sm opacity-90">View and manage all bookings</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/my-hotels"
                    className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl shadow-md transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <FaBuilding className="text-3xl" />
                        <div>
                            <h3 className="text-xl font-semibold">Manage Hotels</h3>
                            <p className="text-sm opacity-90">Add and edit hotel listings</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminHome;