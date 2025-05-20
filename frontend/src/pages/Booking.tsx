import { useQuery } from "react-query";
import * as apiClient from "../api-clients";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../context/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../context/AppContext";

const Booking = () => {
    const { stripePromise } = useAppContext();
    const search = useSearchContext();
    const { hotelId } = useParams();

    const [numberOfNights, setNumberOfNights] = useState<number>(0);

    useEffect(() => {
        if (search.checkIn && search.checkOut) {
            const nights =
                Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
                (1000 * 60 * 60 * 24);

            setNumberOfNights(Math.ceil(nights));
        }
    }, [search.checkIn, search.checkOut]);

    const { data: paymentIntentData } = useQuery(
        "createPaymentIntent",
        () =>
            apiClient.createPaymentIntent(
                hotelId as string,
                numberOfNights.toString()
            ),
        {
            enabled: !!hotelId && numberOfNights > 0,
        }
    );

    const { data: hotel } = useQuery(
        "fetchHotelByID",
        () => apiClient.fetchHotelById(hotelId as string),
        {
            enabled: !!hotelId,
        }
    );

    const { data: currentUser } = useQuery(
        "fetchCurrentUser",
        apiClient.fetchCurrentUser
    );

    const { data: availability, isLoading: checkingAvailability } = useQuery(
        ["roomAvailability", hotelId, search.checkIn, search.checkOut],
        () =>
            search.checkIn && search.checkOut
                ? apiClient.checkRoomAvailability(
                    hotelId as string,
                    search.checkIn,
                    search.checkOut
                )
                : Promise.resolve(null),
        {
            enabled: !!hotelId && !!search.checkIn && !!search.checkOut,
        }
    );

    if (!hotel) {
        return <></>;
    }

    return (
        <div className="grid md:grid-cols-[1fr_2fr]">
            <BookingDetailsSummary
                checkIn={search.checkIn}
                checkOut={search.checkOut}
                adultCount={search.adultCount}
                childCount={search.childCount}
                numberOfNights={numberOfNights}
                hotel={hotel}
                availability={availability}
            />

            {checkingAvailability ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">
                        Checking room availability...
                    </p>
                </div>
            ) : !availability?.available ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    <h3 className="font-bold mb-2">No Rooms Available</h3>
                    <p>Sorry, there are no rooms available for your selected dates.</p>
                    <p className="mt-2">
                        Please try different dates or check another hotel.
                    </p>
                </div>
            ) : currentUser && paymentIntentData ? (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret: paymentIntentData.clientSecret,
                    }}
                >
                    <BookingForm
                        currentUser={currentUser}
                        paymentIntent={paymentIntentData}
                    />
                </Elements>
            ) : null}

            {availability?.available && (
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                    <h3 className="font-bold mb-2">Room Availability</h3>
                    <p>{availability.totalRooms} total rooms in this hotel</p>
                    <p className="mt-2">
                        Available rooms for your dates:{" "}
                        {Math.min(
                            ...availability.availabilityByDate.map(
                                (d) => d.availableRooms
                            )
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Booking;