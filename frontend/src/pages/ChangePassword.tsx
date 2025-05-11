import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as apiClient from "../api-clients";
import { useAppContext } from "../context/AppContext";
import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePassword = () => {
    const { showToast } = useAppContext();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<PasswordFormData>();

    const mutation = useMutation(apiClient.changePassword, {
        onSuccess: () => {
            showToast({ message: "Password updated successfully", type: "success" });
            reset(); // Reset form after successful update
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "error" });
        }
    });

    const onSubmit = handleSubmit((data) => {
        mutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
        });
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-md mx-auto">
                <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Change Password</h2>
                        <p className="text-gray-600 mt-2">Enter your current and new password</p>
                    </div>

                    <div className="space-y-6">
                        <div className="relative">
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                <div className="flex items-center gap-2">
                                    <FiLock className="text-gray-500" />
                                    Current Password
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="border rounded-lg w-full py-2.5 px-4 pr-12 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    {...register("currentPassword", { required: "Current password is required" })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <span className="text-red-500 text-xs mt-1 block">{errors.currentPassword.message}</span>
                            )}
                        </div>

                        <div className="relative">
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                <div className="flex items-center gap-2">
                                    <FiLock className="text-gray-500" />
                                    New Password
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="border rounded-lg w-full py-2.5 px-4 pr-12 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    {...register("newPassword", {
                                        required: "New password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters"
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                            message: "Password must include uppercase, lowercase, number and special character"
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <span className="text-red-500 text-xs mt-1 block">{errors.newPassword.message}</span>
                            )}
                        </div>

                        <div className="relative">
                            <label className="text-gray-700 text-sm font-medium block mb-2">
                                <div className="flex items-center gap-2">
                                    <FiLock className="text-gray-500" />
                                    Confirm New Password
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="border rounded-lg w-full py-2.5 px-4 pr-12 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                                    {...register("confirmPassword", {
                                        validate: (val) => {
                                            if (!val) {
                                                return "This field is required";
                                            } else if (watch("newPassword") !== val) {
                                                return "Passwords do not match";
                                            }
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={mutation.isLoading}
                        className="w-full mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold
                        hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
                        disabled:bg-gray-300 disabled:cursor-not-allowed
                        transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {mutation.isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Updating...
                            </div>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;