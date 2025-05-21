import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from '../api-clients'
import { useAppContext } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import EmailVerification from "../components/EmailVerification";
import { RegisterResponse } from '../types/types';

export type RegisterFormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Register = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useAppContext();
    const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();

    const mutation = useMutation<RegisterResponse, Error, RegisterFormData>(apiClient.register, {
        onSuccess: (data) => {
            showToast({
                message: "Registration successful. Please check your email for verification code.",
                type: "success"
            });
            setUserId(data.userId);
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "error" });
        }
    });

    const onSubmit = handleSubmit((data) => {
        mutation.mutate(data);
    });

    return userId ? (
        <EmailVerification userId={userId} />
    ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
                        <p className="mt-2 text-sm text-gray-600">Join us to start booking your perfect stay</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5">
                        <label className="text-gray-700 text-sm font-bold flex-1">
                            First Name
                            <input
                                className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="John"
                                {...register("firstName", { required: "This field is required." })}
                            />
                            {errors.firstName && (
                                <span className="text-red-500 text-xs mt-1">
                                    {errors.firstName.message}
                                </span>
                            )}
                        </label>

                        <label className="text-gray-700 text-sm font-bold flex-1">
                            Last Name
                            <input
                                className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="Doe"
                                {...register("lastName", { required: "This field is required." })}
                            />
                            {errors.lastName && (
                                <span className="text-red-500 text-xs mt-1">
                                    {errors.lastName.message}
                                </span>
                            )}
                        </label>
                    </div>

                    <label className="text-gray-700 text-sm font-bold">
                        Email
                        <input
                            type="email"
                            className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            placeholder="your@email.com"
                            {...register("email", {
                                required: "This field is required.",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors.email.message}
                            </span>
                        )}
                    </label>

                    <label className="text-gray-700 text-sm font-bold">
                        Password
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="********"
                                {...register("password", {
                                    required: "This field is required.",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters long."
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: "Password must include uppercase, lowercase, number and special character"
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors.password.message}
                            </span>
                        )}
                    </label>

                    <label className="text-gray-700 text-sm font-bold">
                        Confirm Password
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="border rounded w-full py-2 px-3 font-normal focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                placeholder="********"
                                {...register("confirmPassword", {
                                    validate: (val) => {
                                        if (!val) {
                                            return "This field is required";
                                        } else if (watch("password") != val) {
                                            return "Passwords do not match";
                                        }
                                    },
                                })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword.message}
                            </span>
                        )}
                    </label>

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link to="/sign-in" className="text-green-600 hover:text-green-500 font-medium">
                                Sign in
                            </Link>
                        </span>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-500 
                                     transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;