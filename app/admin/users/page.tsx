'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Search, Shield, ShieldOff, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
  order_count?: number;
}

interface UserDetails extends User {
  total_spent?: number;
  address?: string;
  city?: string;
  mobile?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    const admin = await AuthManager.isAdmin();
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    await loadUsers();
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-users`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-users?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load user details');
      }

      setSelectedUser(data.user);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';

      const { error } = await supabase.rpc('set_user_as_admin', {
        user_email: users.find(u => u.id === userId)?.email
      });

      if (error && currentRole === 'user') {
        throw error;
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error('Error toggling admin role:', error);
      alert('Failed to update user role. Make sure the set_user_as_admin function exists.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  User Management
                </h1>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </div>
            <Button onClick={loadUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.order_count || 0}</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(new Date(user.last_sign_in_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadUserDetails(user.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAdminRole(user.id, user.role)}
                              title={user.role === 'admin' ? 'Remove admin role' : 'Make admin'}
                            >
                              {user.role === 'admin' ? (
                                <ShieldOff className="w-4 h-4 text-red-600" />
                              ) : (
                                <Shield className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    {selectedUser.mobile && (
                      <p><span className="font-medium">Mobile:</span> {selectedUser.mobile}</p>
                    )}
                    <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Account Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Total Orders:</span> {selectedUser.order_count}</p>
                    <p><span className="font-medium">Total Spent:</span> LKR {(selectedUser.total_spent || 0).toLocaleString()}</p>
                    <p><span className="font-medium">Joined:</span> {format(new Date(selectedUser.created_at), 'MMM dd, yyyy')}</p>
                    <p><span className="font-medium">Last Login:</span> {format(new Date(selectedUser.last_sign_in_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>

              {(selectedUser.address || selectedUser.city) && (
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <div className="text-sm">
                    {selectedUser.address && <p>{selectedUser.address}</p>}
                    {selectedUser.city && <p>{selectedUser.city}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
