import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as apiClient from '../api-clients';
import { UserType } from '../../../backend/src/shared/types';
import { useAppContext } from '../context/AppContext';
import { FaTrash, FaInfoCircle, FaSearch, FaUserSlash } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import UserDetailsModal from '../components/UserDetailsModal';
import DeactivateUserModal from '../components/DeactivateUserModal';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

const AdminUsers = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // Replace roleFilter
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
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

    const toggleStatusMutation = useMutation(
        ({ userId, reason }: { userId: string; reason?: string }) =>
            apiClient.toggleUserStatus(userId, reason),
        {
            onSuccess: () => {
                showToast({
                    message: selectedUser?.isActive
                        ? "User deactivated successfully"
                        : "User activated successfully",
                    type: "success"
                });
                queryClient.invalidateQueries('fetchUsers');
                setIsDeactivateModalOpen(false);
                setSelectedUser(null);
            },
            onError: () => {
                showToast({ message: "Error updating user status", type: "error" });
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

    const handleToggleStatus = (user: UserType) => {
        setSelectedUser(user);
        setIsDeactivateModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser._id);
        }
    };

    const handleConfirmToggleStatus = (reason?: string) => {
        if (selectedUser) {
            toggleStatusMutation.mutate({
                userId: selectedUser._id,
                reason: selectedUser.isActive ? reason : undefined
            });
        }
    };

    // Filter and search logic
    const filteredUsers = users?.filter(user => {
        const matchesSearch = (
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive) ||
            (statusFilter === 'inactive' && !user.isActive);
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
    const paginatedUsers = filteredUsers?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Users List</h1>
            {/* Search and Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Deactivate/Activate Modal */}
            {selectedUser && (
                <DeactivateUserModal
                    isOpen={isDeactivateModalOpen}
                    onClose={() => {
                        setIsDeactivateModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={handleConfirmToggleStatus}
                    isActive={selectedUser.isActive}
                    userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
                />
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
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
                            {paginatedUsers?.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-full ${user.isActive
                                                ? 'bg-blue-100'
                                                : 'bg-gray-100'
                                                } flex items-center justify-center`}>
                                                <span className={`font-medium ${user.isActive
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600'
                                                    }`}>
                                                    {user.firstName[0]}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                {!user.isActive && (
                                                    <span className="text-xs text-red-600">
                                                        Account Deactivated
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDetailsClick(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                                        >
                                            <FaInfoCircle className="inline-block mr-1" /> Details
                                        </button>
                                        {user.role !== 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                >
                                                    <FaTrash className="inline-block mr-1" /> Delete
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`${user.isActive
                                                        ? 'text-orange-600 hover:text-orange-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                        } ml-4 transition-colors duration-200`}
                                                >
                                                    <FaUserSlash className="inline-block mr-1" />
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* No Results Message */}
            {filteredUsers?.length === 0 && (
                <div className="text-center py-8 bg-white rounded-lg shadow mt-6">
                    <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                </div>
            )}

            {/* Confirmation Modal */}
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