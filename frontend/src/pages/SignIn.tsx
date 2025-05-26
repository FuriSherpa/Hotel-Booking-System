import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from '../api-clients';
import { useAppContext } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export type SignInFormData = {
    email: string;
    password: string;
};

const SignIn = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);

    const { register, formState: { errors, isSubmitting }, handleSubmit } = useForm<SignInFormData>();

    const mutation = useMutation(apiClient.signIn, {
        onSuccess: async () => {
            showToast({ message: "Sign in Successful!", type: "success" });
            await queryClient.invalidateQueries('validateToken');
            navigate(location.state?.from?.pathname || "/");
        }, onError: (error: Error) => {
            showToast({ message: error.message, type: "error" });
        },
    });

    const onSubmit = handleSubmit((data) => {
        mutation.mutate(data);
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="mt-1 text-sm text-gray-600">Please sign in to your account</p>
                    </div>

                    <div className="space-y-4">
                        {/* Email Field */}
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                            <input
                                type="email"
                                className="mt-1 block w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="your@email.com"
                                {...register("email", {
                                    required: "This field is required.",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </label>

                        {/* Password Field */}
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="********"
                                    {...register("password", {
                                        required: "This field is required.",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters long.",
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-500 transition disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="text-center text-sm text-gray-600 space-y-2">
                        <div>
                            Not Registered?{" "}
                            <Link to="/register" className="text-green-600 hover:text-green-500 font-medium">
                                Create an account
                            </Link>
                        </div>
                        <div>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;