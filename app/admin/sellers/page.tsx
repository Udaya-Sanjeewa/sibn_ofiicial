'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthManager } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Store, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AdminSellersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      const isAdmin = await AuthManager.isAdmin();
      if (!isAdmin) {
        router.push('/admin/login');
        return;
      }
      loadSellers();
      setIsLoading(false);
    };

    checkAdminAndLoad();
  }, [router]);

  const loadSellers = async () => {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load sellers');
    } else {
      setSellers(data || []);
    }
  };

  const toggleSellerStatus = async (sellerId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('seller_profiles')
      .update({ is_active: !currentStatus })
      .eq('id', sellerId);

    if (error) {
      toast.error('Failed to update seller status');
    } else {
      toast.success(`Seller ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadSellers();
    }
  };

  const toggleVerification = async (sellerId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('seller_profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', sellerId);

    if (error) {
      toast.error('Failed to update verification status');
    } else {
      toast.success(`Seller ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      loadSellers();
    }
  };

  const filteredSellers = sellers.filter((seller) =>
    seller.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.business_email?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
            <p className="text-gray-600 mt-1">Manage seller accounts and permissions</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {filteredSellers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No sellers found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSellers.map((seller) => (
              <Card key={seller.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {seller.business_logo ? (
                        <img
                          src={seller.business_logo}
                          alt={seller.business_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{seller.business_name}</h3>
                          {seller.is_verified && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                          {seller.is_active ? (
                            <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{seller.business_email}</p>
                        {seller.business_phone && (
                          <p className="text-sm text-gray-600 mb-1">{seller.business_phone}</p>
                        )}
                        {seller.business_description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                            {seller.business_description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>Products: {seller.total_products}</span>
                          <span>Sales: {seller.total_sales}</span>
                          <span>Rating: {seller.rating?.toFixed(1) || '0.0'}/5.0</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVerification(seller.id, seller.is_verified)}
                        className="gap-2"
                      >
                        {seller.is_verified ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Unverify
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </>
                        )}
                      </Button>
                      <Button
                        variant={seller.is_active ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleSellerStatus(seller.id, seller.is_active)}
                      >
                        {seller.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
