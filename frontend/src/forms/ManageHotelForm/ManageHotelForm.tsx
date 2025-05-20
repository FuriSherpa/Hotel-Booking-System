import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";
import { HotelType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";

export type HotelFormData = {
  name: string;
  city: string;
  address: string;
  description: string;
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageFiles: FileList;
  imageUrls: string[];
  adultCount: number;
  childCount: number;
  totalRooms: number;
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: FormData) => void;
  isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  const formMethods = useForm<HotelFormData>();
  const { handleSubmit, reset, register, formState: { errors } } = formMethods;

  useEffect(() => {
    reset(hotel);
  }, [hotel, reset]);

  const onSubmit = handleSubmit((FormDataJson: HotelFormData) => {
    const formData = new FormData();
    if (hotel) {
      formData.append('hotelId', hotel._id);
    }
    formData.append("name", FormDataJson.name);
    formData.append("city", FormDataJson.city);
    formData.append("address", FormDataJson.address);
    formData.append("description", FormDataJson.description);
    formData.append("pricePerNight", FormDataJson.pricePerNight.toString());
    formData.append("starRating", FormDataJson.starRating.toString());
    formData.append("adultCount", FormDataJson.adultCount.toString());
    formData.append("childCount", FormDataJson.childCount.toString());
    formData.append("totalRooms", FormDataJson.totalRooms.toString());

    FormDataJson.facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility);
    });

    if (FormDataJson.imageUrls) {
      FormDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    Array.from(FormDataJson.imageFiles).forEach((imageFile) => {
      formData.append(`imageFiles`, imageFile);
    });

    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <FacilitiesSection />
        <GuestsSection />
        <ImagesSection />
        <div className="flex flex-col gap-2">
          <label htmlFor="totalRooms" className="text-gray-700 font-bold">
            Total Rooms
          </label>
          <input
            type="number"
            className="border rounded w-full py-2 px-3"
            min={1}
            {...register("totalRooms", {
              required: "Total rooms is required",
              min: {
                value: 1,
                message: "Hotel must have at least 1 room",
              },
            })}
          />
          {errors.totalRooms && (
            <span className="text-red-500">{errors.totalRooms.message}</span>
          )}
        </div>
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold cursor-pointer hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;