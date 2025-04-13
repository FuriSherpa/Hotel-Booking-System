import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as apiClient from "../api-clients";
import { useAppContext } from "../context/AppContext";

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePassword = () => {
    const { showToast } = useAppContext();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<PasswordFormData>();

    const mutation = useMutation(apiClient.changePassword, {
        onSuccess: () => {
            showToast({ message: "Password updated successfully", type: "success" });
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
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold">Change Password</h2>

            <label className="text-gray-700 text-sm font-bold">
                Current Password
                <input
                    type="password"
                    className="border rounded w-full py-1 px-2 font-normal"
                    {...register("currentPassword", { required: "Current password is required" })}
                />
                {errors.currentPassword && (
                    <span className="text-red-500">{errors.currentPassword.message}</span>
                )}
            </label>

            <label className="text-gray-700 text-sm font-bold">
                New Password
                <input
                    type="password"
                    className="border rounded w-full py-1 px-2 font-normal"
                    {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                        },
                        // pattern: {
                        //     value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        //     message: "Password must include uppercase, lowercase, number and special character"
                        // }
                    })}
                />
                {errors.newPassword && (
                    <span className="text-red-500">{errors.newPassword.message}</span>
                )}
            </label>

            <label className="text-gray-700 text-sm font-bold">
                Confirm New Password
                <input
                    type="password"
                    className="border rounded w-full py-1 px-2 font-normal"
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
                {errors.confirmPassword && (
                    <span className="text-red-500">{errors.confirmPassword.message}</span>
                )}
            </label>

            <button
                type="submit"
                className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl"
            >
                Update Password
            </button>
        </form>
    );
};

export default ChangePassword;