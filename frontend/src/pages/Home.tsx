import { useQuery } from "react-query";
import * as apiClient from "../api-clients";
import LatestDestinationCard from "../components/LatestDestinationCard";
import { FaHotel, FaConciergeBell, FaStar, FaUsers } from 'react-icons/fa';
import { Link } from "react-router-dom";

const Home = () => {
    const { data: hotels } = useQuery("fetchQuery", () =>
        apiClient.fetchHotels()
    );

    const topRowHotels = hotels?.slice(0, 2) || [];
    const bottomRowHotels = hotels?.slice(2, 5) || [];

    return (
        <div className="space-y-12">
            {/* Hero Stats Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 rounded-xl shadow-md">
                <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
                    <div className="flex flex-col items-center text-center">
                        <FaHotel className="text-4xl text-[#008080] mb-2" />
                        <h3 className="text-2xl font-bold">500+</h3>
                        <p className="text-gray-600">Hotels</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <FaUsers className="text-4xl text-[#008080] mb-2" />
                        <h3 className="text-2xl font-bold">2M+</h3>
                        <p className="text-gray-600">Happy Guests</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <FaStar className="text-4xl text-[#008080] mb-2" />
                        <h3 className="text-2xl font-bold">4.8</h3>
                        <p className="text-gray-600">Average Rating</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <FaConciergeBell className="text-4xl text-[#008080] mb-2" />
                        <h3 className="text-2xl font-bold">24/7</h3>
                        <p className="text-gray-600">Support</p>
                    </div>
                </div>
            </div>

            {/* Latest Destinations Section */}
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900">Latest Destinations</h2>
                    <p className="text-gray-600 mt-2">Discover our most recent additions for your perfect stay</p>
                </div>
                <div className="grid gap-6">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        {topRowHotels.map((hotel) => (
                            <LatestDestinationCard key={hotel._id} hotel={hotel} />
                        ))}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {bottomRowHotels.map((hotel) => (
                            <LatestDestinationCard key={hotel._id} hotel={hotel} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 rounded-xl shadow-md">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose StayEase?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold mb-3 text-[#008080]">Best Price Guarantee</h3>
                            <p className="text-gray-600">Find a lower price? We'll match it and give you an additional 10% off.</p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-semibold mb-3">Free Cancellation</h3>
                            <p className="text-gray-600">Plans change? No problem. Cancel up to 24 hours before check-in.</p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-semibold mb-3">Verified Reviews</h3>
                            <p className="text-gray-600">Real reviews from real guests who have stayed in our hotels.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-[#008080] to-[#008080] text-white py-16 rounded-xl shadow-lg text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
                <p className="mb-6">Book your perfect stay with confidence</p>
                <Link
                    to="/search"
                    className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                    Browse Hotels
                </Link>
            </div>
        </div>
    );
};

export default Home;