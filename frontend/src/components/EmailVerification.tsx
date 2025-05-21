import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as apiClient from '../api-clients';
import { useAppContext } from '../context/AppContext';

interface Props {
    userId: string;
}

const EmailVerification = ({ userId }: Props) => {
    const [otp, setOtp] = useState('');
    const { showToast } = useAppContext();
    const navigate = useNavigate();

    const mutation = useMutation(
        async () => {
            return apiClient.verifyEmail({ userId, otp });
        },
        {
            onSuccess: () => {
                showToast({ message: "Email verified successfully", type: "success" });
                navigate("/");
            },
            onError: (error: Error) => {
                showToast({ message: error.message, type: "error" });
            },
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                <p className="text-gray-600 mb-4">
                    Please enter the verification code sent to your email address.
                </p>
                <input
                    type="text"
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Enter verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="cursor-pointer w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    disabled={mutation.isLoading}
                >
                    {mutation.isLoading ? "Verifying..." : "Verify Email"}
                </button>
            </form>
        </div>
    );
};

export default EmailVerification;