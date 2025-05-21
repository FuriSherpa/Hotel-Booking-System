import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HotelType, BookingType } from '../../../backend/src/shared/types';
import { FaCheckCircle } from 'react-icons/fa';

type PaymentSuccessProps = {
    booking: BookingType;
    hotel: HotelType;
}

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking, hotel } = location.state as PaymentSuccessProps;

    useEffect(() => {
        if (!booking || !hotel) {
            navigate('/');
        }
    }, [booking, hotel, navigate]);

    if (!booking || !hotel) {
        return null;
    }

    const numberOfNights = Math.ceil(
        Math.abs(new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const downloadInvoice = (booking: BookingType, hotel: HotelType) => {
        // Implement the invoice downloading logic here
        console.log('Downloading invoice for', booking, hotel);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="text-center">
                    <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
                </div>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="font-semibold text-xl mb-2">{hotel.name}</h2>
                        <p className="text-gray-600">{hotel.city}, {hotel.address}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Check-in</span>
                            <span className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Check-out</span>
                            <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Number of nights</span>
                            <span className="font-medium">{numberOfNights}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Guests</span>
                            <span className="font-medium">{booking.adultCount} adults, {booking.childCount} children</span>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount</span>
                            <span>NRs {booking.totalCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition-colors mt-6"
                    >
                        Back to Home
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition-colors mt-6"
                        >
                            View Booking
                        </button>
                        <button
                            onClick={() => downloadInvoice(booking, hotel)}
                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-500 transition-colors mt-6"
                        >
                            Download Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;