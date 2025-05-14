import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../context/AppContext";
import * as apiClient from "../api-clients"

const AddHotel = () => {
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
        onSuccess: () => {
            showToast({ message: "Hotel Saved!", type: "success" });
            setTimeout(() => {
                navigate("/my-hotels"); // Navigate after successful save
            }
                , 1500);
        },
        onError: () => {
            showToast({ message: "Error Saving Hotel", type: "error" });
        },
    });

    const handleSave = (hotelFormData: FormData) => {
        mutate(hotelFormData);
    };

    return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;