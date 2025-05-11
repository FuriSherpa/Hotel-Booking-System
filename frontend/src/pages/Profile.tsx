import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import * as apiClient from "../api-clients";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react"; // Add this import

type ProfileFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
};

const Profile = () => {
    const { showToast } = useAppContext();

    const { data: currentUser, refetch } = useQuery(
        "fetchCurrentUser",
        apiClient.fetchCurrentUser
    );

    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ProfileFormData>();

    useEffect(() => {
        if (currentUser) {
            reset({
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                email: currentUser.email,
                phoneNumber: currentUser.phoneNumber,
            });
        }
    }, [currentUser, reset]);

    const mutation = useMutation(apiClient.updateProfile, {
        onSuccess: () => {
            showToast({ message: "Profile updated successfully", type: "success" });
            refetch();
        },
        onError: () => {
            showToast({ message: "Error updating profile", type: "error" });
        }
    });

    const onSubmit = handleSubmit((data) => {
        mutation.mutate(data);
    });

    return (
        <div className="max-w-screen-sm mx-auto mt-8">
            <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>

                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <label className="text-gray-700 text-sm font-bold flex-1">
                            First Name
                            <input
                                type="text"
                                className="border rounded w-full py-2 px-3 font-normal focus:outline-none focus:border-blue-500"
                                {...register("firstName", { required: "This field is required" })}
                            />
                            {errors.firstName && (
                                <span className="text-red-500 text-xs">{errors.firstName.message}</span>
                            )}
                        </label>

                        <label className="text-gray-700 text-sm font-bold flex-1">
                            Last Name
                            <input
                                type="text"
                                className="border rounded w-full py-2 px-3 font-normal focus:outline-none focus:border-blue-500"
                                {...register("lastName", { required: "This field is required" })}
                            />
                            {errors.lastName && (
                                <span className="text-red-500 text-xs">{errors.lastName.message}</span>
                            )}
                        </label>
                    </div>

                    <label className="text-gray-700 text-sm font-bold block">
                        Email
                        <input
                            type="email"
                            disabled
                            className="border rounded w-full py-2 px-3 font-normal bg-gray-100"
                            {...register("email")}
                        />
                    </label>

                    <label className="text-gray-700 text-sm font-bold block">
                        Phone Number
                        <input
                            type="tel"
                            className="border rounded w-full py-2 px-3 font-normal focus:outline-none focus:border-blue-500"
                            {...register("phoneNumber", {
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: "Please enter a valid 10-digit phone number"
                                }
                            })}
                        />
                        {errors.phoneNumber && (
                            <span className="text-red-500 text-xs">{errors.phoneNumber.message}</span>
                        )}
                    </label>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        disabled={!isDirty || mutation.isLoading}
                        className="bg-blue-600 text-white px-4 py-2 font-bold rounded hover:bg-blue-500 disabled:bg-gray-400 transition-colors"
                    >
                        {mutation.isLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;