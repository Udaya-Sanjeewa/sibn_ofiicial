'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import SellerLayout from '@/components/seller/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Package, Eye, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
  seller_id: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  totalItems: number;
  sellerTotal: number;
}

export default function SellerOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusBadgeStats = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const stats = getStatusBadgeStats();

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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage orders containing your products</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
              <p className="text-sm text-gray-600 mt-1">All Orders</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`} onClick={() => setStatusFilter('pending')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'confirmed' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setStatusFilter('confirmed')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              <p className="text-sm text-gray-600 mt-1">Confirmed</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'shipped' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setStatusFilter('shipped')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-sm text-gray-600 mt-1">Shipped</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'delivered' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setStatusFilter('delivered')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-600 mt-1">Delivered</p>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'cancelled' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setStatusFilter('cancelled')}>
            <CardContent className="pt-6 pb-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-600 mt-1">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
              <p className="text-gray-600 mb-2">No orders found</p>
              {statusFilter !== 'all' && (
                <Button variant="link" onClick={() => setStatusFilter('all')}>
                  View all orders
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(order.created_at), 'PPP p')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer</p>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_mobile}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Your Products</p>
                      <p className="font-medium">{order.items.length} product(s)</p>
                      <p className="text-sm text-gray-600">{order.totalItems} total items</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm text-gray-600">Your Total</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(order.sellerTotal)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => viewOrderDetails(order)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              View complete order information and items
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Status</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Date</p>
                  <p className="text-sm">{format(new Date(selectedOrder.created_at), 'PPP p')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium">{selectedOrder.customer_mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedOrder.payment_method.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p className="text-sm">{selectedOrder.shipping_address}</p>
                <p className="text-sm">{selectedOrder.shipping_city} {selectedOrder.shipping_postal_code}</p>
              </div>

              {selectedOrder.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Order Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Your Products in this Order</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product_image}
                        alt={item.product_title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Your Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(selectedOrder.sellerTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SellerLayout>
  );
}
