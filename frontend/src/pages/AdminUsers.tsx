import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-clients';
import { UserType } from '../../../backend/src/shared/types';
import { useAppContext } from '../context/AppContext';
import { FaTrash, FaInfoCircle } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import UserDetailsModal from '../components/UserDetailsModal';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const navigate = useNavigate();

    const { data: users, isLoading } = useQuery('fetchUsers', apiClient.fetchUsers);

    const deleteMutation = useMutation(
        (userId: string) => apiClient.deleteUser(userId),
        {
            onSuccess: () => {
                showToast({ message: "User deleted successfully", type: "success" });
                queryClient.invalidateQueries('fetchUsers');
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            },
            onError: () => {
                showToast({ message: "Error deleting user", type: "error" });
            },
        }
    );

    const handleDeleteClick = (user: UserType) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDetailsClick = (user: UserType) => {
        navigate(`/admin/users/${user._id}`);
    };

    const handleConfirmDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser._id);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users?.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.firstName} {user.lastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleDetailsClick(user)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <FaInfoCircle className="inline-block mr-1" /> Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(user)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <FaTrash className="inline-block mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete customer ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
            />

            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminUsers;