import { FormEvent, useState } from "react";
import { MdTravelExplore } from "react-icons/md";
import { useSearchContext } from "../context/SearchContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const navigate = useNavigate();
    const search = useSearchContext();

    // Define default values from the search context.
    const defaultDestination = search.destination;
    const defaultCheckIn = search.checkIn;
    const defaultCheckOut = search.checkOut;
    const defaultAdultCount = search.adultCount;
    const defaultChildCount = search.childCount;

    // Local state initialized with context values.
    const [destination, setDestination] = useState<string>(defaultDestination);
    const [checkIn, setCheckIn] = useState<Date>(defaultCheckIn);
    const [checkOut, setCheckOut] = useState<Date>(defaultCheckOut);
    const [adultCount, setAdultCount] = useState<number>(defaultAdultCount);
    const [childCount, setChildCount] = useState<number>(defaultChildCount);

    // The form is considered "empty" if all fields are at their default values.
    const isFormEmpty =
        destination === "" &&
        checkIn.getTime() === defaultCheckIn.getTime() &&
        checkOut.getTime() === defaultCheckOut.getTime() &&
        adultCount === 1 &&
        childCount === 0;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        event.stopPropagation();

        search.saveSearchValues(
            destination,
            checkIn,
            checkOut,
            adultCount,
            childCount,
            search.hotelId
        );

        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
            navigate("/search");
        }, 0);
    };

    const handleClear = () => {
        // Only clear if at least one field is not default.
        if (isFormEmpty) return;

        // Reset to default values
        setDestination("");
        setCheckIn(new Date());
        setCheckOut(new Date());
        setAdultCount(1);
        setChildCount(0);

        // Optionally update the search context to reflect these default values.
        search.saveSearchValues("", new Date(), new Date(), 1, 0, "");
        // Optionally navigate to the default list view.
        navigate("/search");
    };

    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
            }}
            className="-m-8 p-3 bg-teal-400 rounded shadow-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-center gap-4">
            <div className="flex flex-row flex-1 items-center bg-white p-2 rounded">
                <MdTravelExplore size={25} className="mr-2" />
                <input
                    type="text"
                    placeholder="Search by city, or hotel name"
                    className="text-md w-full focus:outline-none"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
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
                        value={adultCount}
                        onChange={(event) => setAdultCount(parseInt(event.target.value))}
                    />
                </label>

                <label className="flex items-center">
                    Child:
                    <input
                        className="w-full p-1 focus:outline-none font-bold"
                        type="number"
                        min={0}
                        max={20}
                        value={childCount}
                        onChange={(event) => setChildCount(parseInt(event.target.value))}
                    />
                </label>
            </div>

            <div className="bg-white rounded">
                <DatePicker
                    selected={checkIn}
                    onChange={(date) => setCheckIn(date as Date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-in"
                    className="w-full bg-white p-2 focus:outline-none"
                />
            </div>

            <div className="bg-white rounded">
                <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date as Date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-Out"
                    className="w-full bg-white p-2 focus:outline-none"
                />
            </div>

            <div className="flex gap-1">
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
                    className="w-2/3 bg-blue-600 text-white h-full p-1.5 font-bold text-xl hover:bg-blue-500 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Search
                </button>
                <button
                    type="button"
                    disabled={isFormEmpty}
                    onClick={(e) => {
                        e.preventDefault();
                        handleClear();
                    }}
                    className={`w-1/3 bg-red-600 text-white h-full p-1.5 font-bold text-xl rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 ${isFormEmpty ? "opacity-50 cursor-not-allowed" : "hover:bg-red-500"
                        }`}
                >
                    Clear
                </button>
            </div>
        </form>
    );
};

export default SearchBar;