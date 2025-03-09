import { useQuery } from "react-query";
import { useSearchContext } from "../context/SearchContext"
import * as apiClient from "../api-clients";
import { useState } from "react";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import FacilitiesFilter from "../components/FacilitiesFilter";
import PriceFilter from "../components/PriceFilter";

const Search = () => {
    const search = useSearchContext();
    const [page, setPage] = useState<number>(1);
    const [selectedStars, setSelectedStars] = useState<string[]>([]);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
    const [sortOption, setSortOption] = useState<string>("");

    const searchParams = {
        destination: search.destination,
        checkIn: search.checkIn.toISOString(),
        checkOut: search.checkOut.toISOString(),
        adultCount: search.adultCount.toString(),
        childCount: search.childCount.toString(),
        page: page.toString(),
        stars: selectedStars,
        facilities: selectedFacilities,
        maxPrice: selectedPrice?.toString(),
        sortOption,
    };

    const { data: hotelData } = useQuery(["searchHotels", searchParams], () =>
        apiClient.searchHotels(searchParams));

    const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const starRating = event.target.value;


        setSelectedStars((prevStars) =>
            event.target.checked
                ? [...prevStars, starRating]
                : prevStars.filter((star) => star !== starRating)
        );
    };

    const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const facility = event.target.value;


        setSelectedFacilities((prevFacilities) =>
            event.target.checked
                ? [...prevFacilities, facility]
                : prevFacilities.filter((prevFacility) => prevFacility !== facility)
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
            <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
                <div className="space-y-5">
                    <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
                        Filter by:
                    </h3>

                    <StarRatingFilter
                        selectedStars={selectedStars}
                        onChange={handleStarsChange}
                    />

                    <FacilitiesFilter
                        selectedFacilities={selectedFacilities}
                        onChange={handleFacilityChange}
                    />

                    <PriceFilter
                        selectedPrice={selectedPrice}
                        onChange={(value?: number) => setSelectedPrice(value)}
                    />

                </div>
            </div>
            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">
                        {hotelData?.pagination.total} Hotels Found
                        {search.destination ? ` in ${search.destination}` : ""}
                    </span>
                    <select
                        className="p-2 border rounder-md"
                        value={sortOption}
                        onChange={(event) => setSortOption(event.target.value)}>
                        <option value="starRating">Sort By</option>
                        <option value="starRating">Star Rating</option>
                        <option value="pricePerNightAsc">Price Per Night: Low to High</option>
                        <option value="pricePerNightDesc">Price Per Night: High to Low</option>
                    </select>
                </div>
                {hotelData?.data.map((hotel) => (
                    <SearchResultsCard hotel={hotel} />
                ))}
                <div>
                    <Pagination
                        page={hotelData?.pagination.page || 1}
                        pages={hotelData?.pagination.pages || 1}
                        onPageChange={(page) => setPage(page)}
                    />
                </div>
            </div>
        </div>
    )
}

export default Search;