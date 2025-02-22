import { useMutation } from "react-query";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../context/AppContext";
import * as apiClient from "../api-clients"

const AddHotel = () => {
    const { showToast } = useAppContext();

    const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
        onSuccess: () => {
            showToast({ message: "Hotel Saved!", type: "success" });
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