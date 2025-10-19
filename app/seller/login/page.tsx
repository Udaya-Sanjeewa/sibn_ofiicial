'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SellerLoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const checkSellerAuth = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = session?.user?.user_metadata?.role;

        if (userRole === 'seller') {
          router.push('/seller/dashboard');
        } else {
          toast.error('You need a seller account to access this page');
        }
      }
    };

    if (!isLoading) {
      checkSellerAuth();
    }
  }, [user, isLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userRole = data.user?.user_metadata?.role;

      if (userRole !== 'seller') {
        await supabase.auth.signOut();
        toast.error('This account is not registered as a seller');
        setIsSigningIn(false);
        return;
      }

      toast.success('Welcome back!');
      router.push('/seller/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Seller Login</CardTitle>
            <CardDescription>
              Sign in to manage your products and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seller@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have a seller account?{' '}
                <Link href="/seller/register" className="text-blue-600 hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  Login as Customer
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
