import { useState } from "react";
import { useQuery } from "react-query";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import * as apiClient from "../api-clients";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const AdminDashboard = () => {
    const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            setStartDate(date);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            setEndDate(date);
        }
    };

    const { data: analyticsData, isLoading } = useQuery(
        ["analytics", startDate, endDate],
        () => apiClient.fetchAnalytics({ startDate, endDate })
    );

    if (isLoading || !analyticsData) {
        return <div>Loading...</div>;
    }

    const bookingsChartData = {
        labels: analyticsData.bookingsPerDay.map((day) => day.date),
        datasets: [
            {
                label: "Daily Bookings",
                data: analyticsData.bookingsPerDay.map((day) => day.count),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
            },
        ],
    };

    const revenueChartData = {
        labels: analyticsData.topHotels.map((hotel) => hotel.name),
        datasets: [
            {
                label: "Revenue per Hotel",
                data: analyticsData.topHotels.map((hotel) => hotel.revenue),
                backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
        ],
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

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

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Total Bookings</h2>
                    <p className="text-4xl font-bold text-blue-600">
                        {analyticsData.totalBookings}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Total Revenue</h2>
                    <p className="text-4xl font-bold text-green-600">
                        ${analyticsData.totalRevenue.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Daily Bookings Trend</h2>
                    <Line data={bookingsChartData} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Top Hotels by Revenue</h2>
                    <Bar data={revenueChartData} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;