import { useQuery } from "react-query";
import * as apiClient from "../api-clients";
import SearchResultsCard from "../components/SearchResultsCard";

const Wishlist = () => {
    const { data: hotels, isLoading } = useQuery(
        "fetchWishlist",
        apiClient.fetchWishlist
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!hotels || hotels.length === 0) {
        return <div>No hotels saved to wishlist</div>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            {hotels.map((hotel) => (
                <SearchResultsCard key={hotel._id} hotel={hotel} />
            ))}
        </div>
    );
};

export default Wishlist;