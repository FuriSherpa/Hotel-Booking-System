import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAppContext } from "../context/AppContext";
import * as apiClient from "../api-clients";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

type Props = {
    hotelId: string;
    className?: string;
};

const WishlistButton = ({ hotelId, className }: Props) => {
    const { isLoggedIn } = useAppContext();
    const queryClient = useQueryClient();

    // Fetch wishlist to check if hotel is saved
    const { data: wishlist } = useQuery(
        "fetchWishlist",
        apiClient.fetchWishlist,
        {
            enabled: isLoggedIn,
        }
    );

    const isInWishlist = wishlist?.some(hotel => hotel._id === hotelId);

    const addMutation = useMutation(apiClient.addToWishlist, {
        onSuccess: () => {
            queryClient.invalidateQueries("fetchWishlist");
        },
    });

    const removeMutation = useMutation(apiClient.removeFromWishlist, {
        onSuccess: () => {
            queryClient.invalidateQueries("fetchWishlist");
        },
    });

    const toggleWishlist = () => {
        if (!isLoggedIn) {
            return;
        }

        if (isInWishlist) {
            removeMutation.mutate(hotelId);
        } else {
            addMutation.mutate(hotelId);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={!isLoggedIn}
            className={`${className} ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : ''}`}
            title={isLoggedIn ? 'Toggle wishlist' : 'Please login to save hotels'}
        >
            {isInWishlist ? (
                <AiFillHeart className="text-red-500 text-2xl" />
            ) : (
                <AiOutlineHeart className="text-2xl" />
            )}
        </button>
    );
};

export default WishlistButton;