import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";

export type HotelFormData = {
    name: string;
    city: string;
    address: string;
    description: string;
    type: string;
    price: number;
    starRating: number;
    facilities: string[];
    imageFiles: FileList;
    adultCount: number;
    childCount: number;
}

const ManageHotelForm = () => {
    const formMethods = useForm<HotelFormData>();
  return (
  <FormProvider {...formMethods}>
    <form>
        <DetailsSection/>
    </form>
    </FormProvider>
  );
};

export default ManageHotelForm
