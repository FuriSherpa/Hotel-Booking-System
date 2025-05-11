import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from "react-query"
import { FaSignOutAlt } from 'react-icons/fa';
import * as apiClient from '../api-clients';
import { useAppContext } from "../context/AppContext";

const SignOutButton = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { logout, showToast } = useAppContext();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setShowConfirmation(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const mutation = useMutation(apiClient.signOut, {
        onSuccess: async () => {
            await queryClient.invalidateQueries('validateToken');
            showToast({ message: "Signed Out!", type: "success" });
        },
        onError: (error: Error) => {
            showToast({ message: error.message, type: "error" });
        }
    });

    const handleSignOut = () => {
        setShowConfirmation(true);
    };

    const confirmSignOut = () => {
        mutation.mutate();
        logout();
        navigate('/');
        setShowConfirmation(false);
    };

    const cancelSignOut = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="relative">
            <button
                onClick={handleSignOut}
                className="flex items-center text-white px-3 font-bold hover:text-[#FF7F50] transition-colors"
            >
                <FaSignOutAlt className="text-xl mr-2" />
                Sign Out
            </button>

            {showConfirmation && (
                <div
                    ref={modalRef}
                    className="absolute right-0 top-12 bg-white rounded-lg shadow-xl w-72 z-50"
                >
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">
                            Confirm Sign Out
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to sign out?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={cancelSignOut}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSignOut}
                                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignOutButton;