import { UserType } from "../../../backend/src/shared/types";
import { FiUser, FiMail, FiPhone, FiCalendar } from "react-icons/fi";

interface Props {
    user: UserType;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailsModal = ({ user, isOpen, onClose }: Props) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <FiUser className="text-gray-400 w-5 h-5" />
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <FiMail className="text-gray-400 w-5 h-5" />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <FiPhone className="text-gray-400 w-5 h-5" />
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium">{user.phoneNumber || "Not provided"}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <FiCalendar className="text-gray-400 w-5 h-5" />
                        <div>
                            <p className="text-sm text-gray-500">Wishlist Count</p>
                            <p className="font-medium">{user.wishlist?.length || 0} hotels</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;