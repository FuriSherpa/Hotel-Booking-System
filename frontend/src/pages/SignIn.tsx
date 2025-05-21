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
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-gray-700 text-sm font-bold block">
                            Email
                            <div className="mt-1">
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
                            </div>
                        </label>

                        <label className="text-gray-700 text-sm font-bold block">
                            Password
                            <div className="mt-1 relative">
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
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                                {errors.password && (
                                    <span className="text-red-500 text-xs mt-1">
                                        {errors.password.message}
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-600">
                            Not Registered?{" "}
                            <Link className="text-green-600 hover:text-green-500 font-medium" to="/register">
                                Create an account
                            </Link>
                        </span>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-500 
                                     transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;