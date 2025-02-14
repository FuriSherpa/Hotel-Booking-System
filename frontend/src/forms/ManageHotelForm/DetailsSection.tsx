import { useFormContext } from "react-hook-form"
import { HotelFormData } from "./ManageHotelForm";

const DetailsSection = () => {
    const { register, formState: { errors }, } = useFormContext<HotelFormData>();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold mb-3">Add Hotel</h1>
            <label className="text-gray-700 text-sm font-bold flex-1">
                Name
                <input
                    type="text"
                    className="border rounded w-full py-1 px-2 font-normal"
                    {...register("name", { required: "This field is required." })}
                ></input>
                {errors.name && (
                    <span className="text-red-500">
                        {errors.name.message}
                    </span>
                )}
            </label>

            <div className="flex gap-4">
                <label className="text-gray-700 text-sm font-bold flex-1">
                    City
                    <input
                        type="text"
                        className="border rounded w-full py-1 px-2 font-normal"
                        {...register("city", { required: "This field is required." })}
                    ></input>
                    {errors.city && (
                        <span className="text-red-500">
                            {errors.city.message}
                        </span>
                    )}
                </label>

                <label className="text-gray-700 text-sm font-bold flex-1">
                    Address
                    <input
                        type="text"
                        className="border rounded w-full py-1 px-2 font-normal"
                        {...register("address", { required: "This field is required." })}
                    ></input>
                    {errors.address && (
                        <span className="text-red-500">
                            {errors.address.message}
                        </span>
                    )}
                </label>
            </div>

            <label className="text-gray-700 text-sm font-bold flex-1">
                Description
                <textarea
                    rows={10}
                    className="border rounded w-full py-1 px-2 font-normal"
                    {...register("description", { required: "This field is required." })}
                ></textarea>
                {errors.description && (
                    <span className="text-red-500">
                        {errors.description.message}
                    </span>
                )}
            </label>

            <label className="text-gray-700 text-sm font-bold max-w-[50%">
                Price Per Night
                <input
                    type="number"
                    min={1}
                    className="border rounded w-full py-1 px-2 font-normal"
                    {...register("price", { required: "This field is required." })}
                ></input>
                {errors.price && (
                    <span className="text-red-500">
                        {errors.price.message}
                    </span>
                )}
            </label>

            <label className="text-gray-700 text-sm font-bold max-w-[50%">
                Star Rating
                <select {...register("starRating", {
                    required: "This field is required.",
                })}
                className="border rounded w-full p-2 text-gray-700 font-normal"
                >
                    <option value="1" className="text-sm font-bold">
                        Select as Rating
                    </option>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <option value={num}>
                            {num}
                        </option>
                    ))}
                </select>
                {errors.starRating && (
                    <span className="text-red-500">
                        {errors.starRating.message}
                    </span>
                )}
            </label>
        </div>
    )
}

export default DetailsSection;