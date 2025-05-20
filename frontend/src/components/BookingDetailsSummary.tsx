import { HotelType } from "../../../backend/src/shared/types";
import { RoomAvailabilityResponse } from "../../../backend/src/shared/types";

interface Props {
    checkIn: Date;
    checkOut: Date;
    adultCount: number;
    childCount: number;
    numberOfNights: number;
    hotel: HotelType;
    availability: RoomAvailabilityResponse | null | undefined;
}

const BookingDetailsSummary = ({
    checkIn,
    checkOut,
    adultCount,
    childCount,
    numberOfNights,
    hotel,
    availability,
}: Props) => {
    return (
        <div className="grid gap-4 rounded-lg border border-slate-300 p-5 h-fit mt-5">
            <h2 className="text-xl font-bold">Your Booking Details</h2>
            <div className="border-b py-2">
                Location:
                <div className="font-bold">{`${hotel.name}, ${hotel.city}, ${hotel.address}`}</div>
            </div>
            <div className="flex justify-between">
                <div>
                    Check-in
                    <div className="font-bold"> {checkIn.toDateString()}</div>
                </div>
                <div>
                    Check-out
                    <div className="font-bold"> {checkOut.toDateString()}</div>
                </div>
            </div>
            <div className="border-t border-b py-2">
                Total length of stay:
                <div className="font-bold">{numberOfNights} nights</div>
            </div>

            <div>
                Guests{" "}
                <div className="font-bold">
                    {adultCount} adults & {childCount} children
                </div>
            </div>

            {/* Add availability information if needed */}
            {availability && (
                <div className="border-t border-slate-300 pt-4">
                    <p className="font-bold">Room Availability:</p>
                    <p>{availability.totalRooms} total rooms</p>
                    <p>
                        {Math.min(
                            ...availability.availabilityByDate.map(
                                (d) => d.availableRooms
                            )
                        )}{" "}
                        rooms available for your dates
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookingDetailsSummary;