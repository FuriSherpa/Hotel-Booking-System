import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import * as apiClient from '../api-clients';
import { FaChartLine, FaBook, FaHotel, FaUsers, FaMoneyBill } from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminHome = () => {
    const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const { data: analyticsData, isLoading } = useQuery(
        ["analytics", startDate, endDate],
        () => apiClient.fetchAnalytics({ startDate, endDate })
    );

    const handleStartDateChange = (date: Date | null) => {
        if (date) setStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) setEndDate(date);
    };

    if (isLoading || !analyticsData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const bookingsChartData = {
        labels: analyticsData.bookingsPerDay.map((day) => day.date),
        datasets: [{
            label: "Daily Bookings",
            data: analyticsData.bookingsPerDay.map((day) => day.count),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
        }],
    };

    const revenueChartData = {
        labels: analyticsData.topHotels.map((hotel) => hotel.name),
        datasets: [{
            label: "Revenue per Hotel",
            data: analyticsData.topHotels.map((hotel) => hotel.revenue),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
        }],
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex gap-4 items-center">
                    <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        maxDate={endDate}
                        className="border rounded p-2"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        maxDate={new Date()}
                        className="border rounded p-2"
                    />
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80">Total Bookings</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {analyticsData.totalBookings}
                            </h3>
                        </div>
                        <FaBook className="text-4xl opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-1">
                                Rs {analyticsData.totalRevenue.toFixed(2)}
                            </h3>
                        </div>
                        <FaMoneyBill className="text-4xl opacity-80" />
                    </div>
                </div>

                {/* <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80">Top Hotels</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {analyticsData.topHotels.length}
                            </h3>
                        </div>
                        <FaHotel className="text-4xl opacity-80" />
                    </div>
                </div> */}

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80">Average Daily Bookings</p>
                            <h3 className="text-3xl font-bold mt-1">
                                {(analyticsData.totalBookings / analyticsData.bookingsPerDay.length).toFixed(1)}
                            </h3>
                        </div>
                        <FaChartLine className="text-4xl opacity-80" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Booking Trends</h2>
                    <Line
                        data={bookingsChartData}
                        options={{
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'category',
                                    display: true
                                },
                                y: {
                                    type: 'linear',
                                    display: true
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'top' as const,
                                },
                                title: {
                                    display: true,
                                    text: 'Daily Booking Trends'
                                },
                            },
                        }}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Top Performing Hotels</h2>
                    <Bar
                        data={revenueChartData}
                        options={{
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'category',
                                    display: true
                                },
                                y: {
                                    type: 'linear',
                                    display: true
                                }
                            },
                            plugins: {
                                legend: {
                                    position: 'top' as const,
                                },
                                title: {
                                    display: true,
                                    text: 'Revenue by Hotel'
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/admin/bookings"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200"
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
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <FaHotel className="text-3xl" />
                        <div>
                            <h3 className="text-xl font-semibold">Manage Hotels</h3>
                            <p className="text-sm opacity-90">Add and edit hotel listings</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/admin/users"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl shadow-lg transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                        <FaUsers className="text-3xl" />
                        <div>
                            <h3 className="text-xl font-semibold">Manage Users</h3>
                            <p className="text-sm opacity-90">View and manage user accounts</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminHome;