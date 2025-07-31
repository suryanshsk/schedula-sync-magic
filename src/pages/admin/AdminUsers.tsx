import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { userStorage } from '@/lib/storage';
import { User } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const allUsers = userStorage.getAll();
  
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateUserStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      userStorage.update(userId, { status: newStatus, updatedAt: new Date().toISOString() });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: 'user' | 'organizer' | 'admin') => {
    try {
      userStorage.update(userId, { 
        role: newRole, 
        status: newRole === 'organizer' ? 'pending' : 'active',
        updatedAt: new Date().toISOString() 
      });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const roles = ['all', 'user', 'organizer', 'admin'];
  const statuses = ['all', 'active', 'pending', 'suspended'];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{allUsers.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizers</p>
                <p className="text-2xl font-bold">{allUsers.filter(u => u.role === 'organizer').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{allUsers.filter(u => u.status === 'pending').length}</p>
              </div>
              <UserX className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {roles.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role === 'all' ? 'All Roles' : role}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Status' : status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{userItem.name}</p>
                          <p className="text-sm text-muted-foreground">{userItem.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={userItem.role === 'admin' ? 'default' : userItem.role === 'organizer' ? 'secondary' : 'outline'}>
                        {userItem.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={
                        userItem.status === 'active' ? 'default' : 
                        userItem.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {userItem.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm">{new Date(userItem.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {userItem.id !== user.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {userItem.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUpdateUserStatus(userItem.id, 'suspended')}>
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUpdateUserStatus(userItem.id, 'active')}>
                                Activate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleUpdateUserRole(userItem.id, 'user')}>
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateUserRole(userItem.id, 'organizer')}>
                              Set as Organizer
                            </DropdownMenuItem>
                            {userItem.role !== 'admin' && (
                              <DropdownMenuItem onClick={() => handleUpdateUserRole(userItem.id, 'admin')}>
                                Set as Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
