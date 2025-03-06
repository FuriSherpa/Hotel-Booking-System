import { FormEvent, useState } from "react";
import { MdTravelExplore } from "react-icons/md";
import { useSearchContext } from "../context/SearchContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const navigate = useNavigate();
    const search = useSearchContext();
    const [destination, setDestination] = useState<string>(search.destination);
    const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
    const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
    const [adultCount, setAdultCount] = useState<number>(search.adultCount);
    const [childCount, setChildCount] = useState<number>(search.childCount);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        search.saveSearchValues(destination, checkIn, checkOut, adultCount, childCount, search.hotelId);
        navigate("/search");
    };

    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getFullYear() + 1);

    return (
        <form
            onSubmit={handleSubmit}
            className="-m-8 p-3 bg-green-300 rounded shadow-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-center gap-4">
            <div className="flex flex-row flex-1 items-center bg-white p-2 rounded">
                <MdTravelExplore size={25} className="mr-2" />
                <input
                    type="text"
                    placeholder="Destination"
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
                <button className="w-2/3 bg-blue-600 text-white h-full p-1.5 font-bold text-xl hover:bg-blue-500 rounded cursor-pointer">
                    Search
                </button>
                <button className="w-1/3 bg-red-600 text-white h-full p-1.5 font-bold text-xl hover:bg-red-500 rounded cursor-pointer">
                    Clear
                </button>
            </div>
        </form>
    );
};

export default SearchBar;