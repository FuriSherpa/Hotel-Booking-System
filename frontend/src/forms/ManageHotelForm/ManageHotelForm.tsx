import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";

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
    const {handleSubmit} = formMethods;

    const onSubmit = handleSubmit((FormData:HotelFormData) => {
      console.log(FormData);
    })
  return (
  <FormProvider {...formMethods}>
    <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection/>
        <FacilitiesSection/>
        <GuestsSection/>
        <ImagesSection/>
        <span className="flex justify-end">
          <button
          type="submit" 
          className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl">
            Save
          </button>
        </span>
    </form>
    </FormProvider>
  );
};

export default ManageHotelForm
