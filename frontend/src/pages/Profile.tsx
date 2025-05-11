import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import * as apiClient from "../api-clients";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";
import { FiUser, FiMail, FiPhone } from "react-icons/fi"; // Add this import

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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-screen-sm mx-auto">
                <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
                        <p className="text-gray-600 mt-2">Update your personal information</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <label className="text-gray-700 text-sm font-medium flex-1">
                                <span className="mb-2 flex items-center">
                                    <FiUser className="inline-block mr-2" />
                                    First Name
                                </span>
                                <input
                                    type="text"
                                    className="border rounded-lg w-full py-2.5 px-4 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    {...register("firstName", { required: "This field is required" })}
                                />
                                {errors.firstName && (
                                    <span className="text-red-500 text-xs mt-1 block">{errors.firstName.message}</span>
                                )}
                            </label>

                            <label className="text-gray-700 text-sm font-medium flex-1">
                                <span className="mb-2 flex items-center">
                                    <FiUser className="inline-block mr-2" />
                                    Last Name
                                </span>
                                <input
                                    type="text"
                                    className="border rounded-lg w-full py-2.5 px-4 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    {...register("lastName", { required: "This field is required" })}
                                />
                                {errors.lastName && (
                                    <span className="text-red-500 text-xs mt-1 block">{errors.lastName.message}</span>
                                )}
                            </label>
                        </div>

                        <label className="text-gray-700 text-sm font-medium block">
                            <span className="mb-2 flex items-center">
                                <FiMail className="inline-block mr-2" />
                                Email Address
                            </span>
                            <input
                                type="email"
                                disabled
                                className="border rounded-lg w-full py-2.5 px-4 font-normal bg-gray-50 text-gray-500 cursor-not-allowed"
                                {...register("email")}
                            />
                        </label>

                        <label className="text-gray-700 text-sm font-medium block">
                            <span className="mb-2 flex items-center">
                                <FiPhone className="inline-block mr-2" />
                                Phone Number
                            </span>
                            <input
                                type="tel"
                                className="border rounded-lg w-full py-2.5 px-4 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                placeholder="Enter your 10-digit phone number"
                                {...register("phoneNumber", {
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: "Please enter a valid 10-digit phone number"
                                    }
                                })}
                            />
                            {errors.phoneNumber && (
                                <span className="text-red-500 text-xs mt-1 block">{errors.phoneNumber.message}</span>
                            )}
                        </label>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            type="submit"
                            disabled={!isDirty || mutation.isLoading}
                            className="bg-blue-600 text-white px-6 py-2.5 font-semibold rounded-lg hover:bg-blue-500 
                            disabled:bg-gray-300 disabled:cursor-not-allowed transform hover:scale-[1.02] 
                            transition-all duration-200 flex items-center gap-2"
                        >
                            {mutation.isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;