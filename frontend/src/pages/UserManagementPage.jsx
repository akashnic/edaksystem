import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DataTable } from '../components/table/DataTable';
import { getUserColumns } from '../configs/userColumns';
import { getUserFormFields } from '../configs/userFormConfig';
import { FormWrapper } from '../components/form/FormWrapper';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { Plus, Edit, Key, Search, UserCheck, UserMinus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { InputField } from '../components/form/InputField';

export function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer/Modal states
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('accounts/users/');
      setUsers(res.data?.results || res.data || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateOrUpdateUser = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await api.put(`accounts/users/${selectedUser.id}/`, formData);
        toast.success("User updated successfully");
      } else {
        await api.post('accounts/users/', formData);
        toast.success("User created successfully");
      }
      setIsUserDrawerOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(selectedUser ? "Update failed" : "Creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`accounts/users/${selectedUser.id}/reset-password/`, {
        new_password: data.new_password
      });
      toast.success(`Password reset for ${selectedUser.username}`);
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error("Password reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.patch(`accounts/users/${user.id}/`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    ...getUserColumns().map(col => {
      if (col.key === 'is_active') {
        return {
          ...col,
          render: (row) => (
            <Badge variant={row.is_active ? 'received' : 'dispatched'}>
              {row.is_active ? 'Active' : 'Inactive'}
            </Badge>
          )
        };
      }
      if (col.key === 'role') {
        return {
          ...col,
          render: (row) => {
            const roleLabels = {
              'ADMIN': 'Admin',
              'RECEIVER': 'Receiver',
              'DISPATCHER': 'Dispatcher'
            };
            return <span className="font-medium">{roleLabels[row.role] || row.role}</span>;
          }
        };
      }
      return col;
    }),
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(row); setIsUserDrawerOpen(true); }} title="Edit User">
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setSelectedUser(row); setIsPasswordModalOpen(true); }} title="Reset Password">
            <Key className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => toggleUserStatus(row)} 
            title={row.is_active ? "Deactivate" : "Activate"}
            className={row.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
          >
            {row.is_active ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system administrators and register operators.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { setSelectedUser(null); setIsUserDrawerOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
        />
      </div>

      <Drawer
        isOpen={isUserDrawerOpen}
        onClose={() => { setIsUserDrawerOpen(false); setSelectedUser(null); }}
        title={selectedUser ? "Edit User" : "Add New User"}
      >
        <FormWrapper
          config={getUserFormFields(!!selectedUser)}
          onSubmit={handleCreateOrUpdateUser}
          defaultValues={selectedUser || { role: 'RECEIVER', is_active: true }}
          isLoading={isSubmitting}
          submitLabel={selectedUser ? "Update User" : "Create User"}
        />
      </Drawer>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Password"
      >
        <PasswordResetForm 
          username={selectedUser?.username} 
          onSubmit={handleResetPassword} 
          isLoading={isSubmitting} 
        />
      </Modal>
    </div>
  );
}

function PasswordResetForm({ username, onSubmit, isLoading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-gray-600">Resetting password for <strong>{username}</strong></p>
      <InputField
        label="New Password"
        name="new_password"
        type="password"
        register={register}
        required={true}
        error={errors.new_password}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );
}
