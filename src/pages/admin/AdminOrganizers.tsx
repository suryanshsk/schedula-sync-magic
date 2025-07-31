import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { userStorage, notificationStorage } from '@/lib/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AdminOrganizers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const allOrganizers = userStorage.getAll().filter(u => u.role === 'organizer');
  const pendingOrganizers = allOrganizers.filter(u => u.status === 'pending');
  const activeOrganizers = allOrganizers.filter(u => u.status === 'active');
  const suspendedOrganizers = allOrganizers.filter(u => u.status === 'suspended');
  
  const filteredOrganizers = allOrganizers.filter(organizer => {
    const matchesSearch = organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleApproveOrganizer = (organizerId: string) => {
    try {
      userStorage.update(organizerId, { 
        status: 'active', 
        updatedAt: new Date().toISOString() 
      });
      
      // Create notification for the organizer
      notificationStorage.create({
        userId: organizerId,
        type: 'success',
        title: 'Account Approved',
        message: 'Your organizer account has been approved! You can now create events.',
      });

      toast.success('Organizer approved successfully');
    } catch (error) {
      toast.error('Failed to approve organizer');
    }
  };

  const handleRejectOrganizer = (organizerId: string) => {
    try {
      userStorage.update(organizerId, { 
        status: 'suspended', 
        updatedAt: new Date().toISOString() 
      });
      
      // Create notification for the organizer
      notificationStorage.create({
        userId: organizerId,
        type: 'error',
        title: 'Account Rejected',
        message: 'Your organizer application has been rejected. Please contact support for more information.',
      });

      toast.success('Organizer rejected');
    } catch (error) {
      toast.error('Failed to reject organizer');
    }
  };

  const handleSuspendOrganizer = (organizerId: string) => {
    try {
      userStorage.update(organizerId, { 
        status: 'suspended', 
        updatedAt: new Date().toISOString() 
      });
      
      // Create notification for the organizer
      notificationStorage.create({
        userId: organizerId,
        type: 'warning',
        title: 'Account Suspended',
        message: 'Your organizer account has been suspended. Please contact support.',
      });

      toast.success('Organizer suspended');
    } catch (error) {
      toast.error('Failed to suspend organizer');
    }
  };

  const handleReactivateOrganizer = (organizerId: string) => {
    try {
      userStorage.update(organizerId, { 
        status: 'active', 
        updatedAt: new Date().toISOString() 
      });
      
      // Create notification for the organizer
      notificationStorage.create({
        userId: organizerId,
        type: 'success',
        title: 'Account Reactivated',
        message: 'Your organizer account has been reactivated. You can now create events again.',
      });

      toast.success('Organizer reactivated');
    } catch (error) {
      toast.error('Failed to reactivate organizer');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Approve Organizers</h1>
        <p className="text-muted-foreground">Review and manage organizer applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{pendingOrganizers.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Organizers</p>
                <p className="text-2xl font-bold">{activeOrganizers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">{suspendedOrganizers.length}</p>
              </div>
              <UserX className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Organizers</p>
                <p className="text-2xl font-bold">{allOrganizers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Organizers Table */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Organizers ({filteredOrganizers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Organizer</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Applied Date</th>
                  <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map((organizer) => (
                  <tr key={organizer.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {organizer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{organizer.name}</p>
                          <p className="text-sm text-muted-foreground">{organizer.email}</p>
                          {organizer.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{organizer.bio}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={
                          organizer.status === 'active' ? 'default' : 
                          organizer.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {organizer.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm">{new Date(organizer.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm">{new Date(organizer.updatedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {organizer.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApproveOrganizer(organizer.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectOrganizer(organizer.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {organizer.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleSuspendOrganizer(organizer.id)}>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {organizer.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleReactivateOrganizer(organizer.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrganizers.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No organizers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
