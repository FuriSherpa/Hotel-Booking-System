import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { useSearchContext } from "../../context/SearchContext";
import { useAppContext } from "../../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from 'react-query';
import * as apiClient from "../../api-clients";

type Props = {
    hotelId: string;
    pricePerNight: number;
}

type GuestInfoFormData = {
    checkIn: Date;
    checkOut: Date;
    adultCount: number;
    childCount: number;
}

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
    const search = useSearchContext();
    const { isLoggedIn } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const { watch, register, handleSubmit, setValue, formState: { errors },
    } = useForm<GuestInfoFormData>({
        defaultValues: {
            checkIn: search.checkIn,
            checkOut: search.checkOut,
            adultCount: search.adultCount,
            childCount: search.childCount,
        },
    });

    const checkIn = watch("checkIn");
    const checkOut = watch("checkOut");

    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    const onSignInClick = (data: GuestInfoFormData) => {
        search.saveSearchValues("", data.checkIn, data.checkOut, data.adultCount, data.childCount, "");
        navigate("/sign-in", { state: { from: location } });
    }

    const onSubmit = (data: GuestInfoFormData) => {
        search.saveSearchValues("", data.checkIn, data.checkOut, data.adultCount, data.childCount, "");
        navigate(`/hotel/${hotelId}/booking`, { state: { from: location } });
    }

    const { data: availability } = useQuery(
        ['roomAvailability', hotelId, checkIn, checkOut],
        () => checkIn && checkOut ?
            apiClient.checkRoomAvailability(hotelId, checkIn, checkOut) :
            Promise.resolve(null),
        {
            enabled: !!hotelId && !!checkIn && !!checkOut
        }
    );

    return (
        <div className="flex flex-col p-4 bg-blue-200 gap-4">
            <h3 className="text-md font-bold">NRs {pricePerNight}</h3>
            <form onSubmit={isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)}>
                <div className="grid grid-cols-1 gap-4 items-center">
                    <div>
                        <DatePicker
                            required
                            selected={checkIn}
                            onChange={(date) => setValue("checkIn", date as Date)}
                            selectsStart
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={minDate}
                            maxDate={maxDate}
                            placeholderText="Check-in Date"
                            className="w-full bg-white p-2 focus:outline-none"
                            wrapperClassName="min-w-full"
                        />
                    </div>

                    <div>
                        <DatePicker
                            required
                            selected={checkOut}
                            onChange={(date) => setValue("checkOut", date as Date)}
                            selectsStart
                            startDate={checkIn}
                            endDate={checkOut}
                            minDate={minDate}
                            maxDate={maxDate}
                            placeholderText="Check-out Date"
                            className="w-full bg-white p-2 focus:outline-none"
                            wrapperClassName="min-w-full"
                        />
                    </div>

                    <div className="flex items-center bg-white px-2 py-1 rounded gap-2">
                        <label className="flex items-center">
                            Adults:
                            <input
                                className="w-full p-1 focus:outline-none font-bold"
                                type="number"
                                min={1}
                                max={20}
                                {...register("adultCount",
                                    {
                                        required: "This field is required",
                                        min: {
                                            value: 1,
                                            message: "There must be at least one adult."
                                        },
                                        valueAsNumber: true,
                                    })}
                            />
                        </label>

                        <label className="flex items-center">
                            Child:
                            <input
                                className="w-full p-1 focus:outline-none font-bold"
                                type="number"
                                min={0}
                                max={20}
                                {...register("childCount",
                                    {
                                        valueAsNumber: true,
                                    })}
                            />
                        </label>
                        {errors.adultCount && (
                            <span className="text-red-500 font-semibold font-sm">
                                {errors.adultCount.message}
                            </span>
                        )}
                    </div>
                    {availability && !availability.available && (
                        <div className="text-red-500 text-sm">
                            No rooms available for selected dates
                        </div>
                    )}

                    {availability && availability.available && (
                        <div className="text-green-500 text-sm">
                            {Math.min(...availability.availabilityByDate.map(d => d.availableRooms))} rooms available
                        </div>
                    )}

                    {isLoggedIn ? (
                        <button
                            type="submit"
                            className="bg-blue-600 text-white h-full p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
                            disabled={!availability?.available}
                        >
                            Book Now
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="bg-blue-600 text-white h-full p-2 font-bold hover:bg-blue-500 text-xl"
                        >
                            Login to Book
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default GuestInfoForm;
