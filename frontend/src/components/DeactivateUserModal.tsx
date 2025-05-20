import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isActive: boolean;
    userName: string;
}

const DeactivateUserModal = ({ isOpen, onClose, onConfirm, isActive, userName }: Props) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    return (
        <div className="mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                    {isActive ? 'Deactivate' : 'Activate'} User Account
                </h2>
                <p className="mb-4 text-gray-600">
                    {isActive
                        ? `Are you sure you want to deactivate ${userName}'s account?`
                        : `Are you sure you want to reactivate ${userName}'s account?`}
                </p>
                {isActive && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Deactivation
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded-md p-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Please provide a reason for deactivation..."
                            required
                        />
                    </div>
                )}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(reason);
                            setReason('');
                        }}
                        disabled={isActive && !reason.trim()}
                        className={`px-4 py-2 rounded text-white ${isActive
                                ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                                : 'bg-green-500 hover:bg-green-600'
                            } disabled:cursor-not-allowed`}
                    >
                        {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeactivateUserModal;