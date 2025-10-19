'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SellerOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        router.push('/auth/signin');
        return;
      }

      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = session?.user?.user_metadata?.role;

        if (userRole !== 'seller') {
          router.push('/auth/signin');
          return;
        }

        loadOrders();
      }
    };

    checkAuth();
  }, [user, isLoading, router]);

  const loadOrders = async () => {
    if (!user) return;

    setIsLoadingOrders(true);

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (itemsError) {
      toast.error('Failed to load orders');
      setIsLoadingOrders(false);
      return;
    }

    const groupedOrders = orderItems?.reduce((acc: any, item: any) => {
      const orderId = item.order_id;
      if (!acc[orderId]) {
        acc[orderId] = {
          ...item.orders,
          items: [],
          totalItems: 0,
          sellerTotal: 0,
        };
      }
      acc[orderId].items.push(item);
      acc[orderId].totalItems += item.quantity;
      acc[orderId].sellerTotal += Number(item.subtotal);
      return acc;
    }, {});

    setOrders(Object.values(groupedOrders || {}));
    setIsLoadingOrders(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Manage orders containing your products</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by order number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoadingOrders ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(order.created_at), 'PPP')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_mobile}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Shipping Address</p>
                      <p className="text-sm">
                        {order.shipping_address}, {order.shipping_city}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium">Your Products in this Order:</p>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product_image}
                          alt={item.product_title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_title}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.totalItems} item(s)
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment: {order.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Your Total</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(order.sellerTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
