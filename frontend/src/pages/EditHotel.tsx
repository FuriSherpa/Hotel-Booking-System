import { useMutation, useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import * as apiClient from "../api-clients"
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../context/AppContext";

const EditHotel = () => {
    const { hotelId } = useParams();
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const { data: hotel } = useQuery("fetchMyHotelById", () =>
        apiClient.fetchMyHotelById(hotelId || ''), {
        enabled: !!hotelId,
    });

    const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
        onSuccess: () => {
            showToast({ message: "Hotel Updated!", type: "success" });
            setTimeout(() => {
                navigate("/my-hotels"); // Navigate after successful update
            }
                , 1500);
        },
        onError: () => {
            showToast({ message: "Error Updating Hotel", type: "error" });
        },
    });

    const handleSave = (hotelFormData: FormData) => {
        mutate(hotelFormData);
    };

    return (
        <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading} />
    );
};

export default EditHotel;