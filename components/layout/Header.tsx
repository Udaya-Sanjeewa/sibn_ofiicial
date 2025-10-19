"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, User, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWatchlist } from '@/hooks/useWatchlist';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { WatchlistDrawer } from '@/components/watchlist/WatchlistDrawer';
import { AuthButton } from '@/components/auth/AuthButton';
import { getCategories } from '@/lib/products';
import type { Category } from '@/types';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { itemCount } = useCart();
  const { itemCount: watchlistCount } = useWatchlist();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span>📞 +94 11 234 5678</span>
                <span>✉️ support@sibnecommerce.lk</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/help" className="hover:text-blue-200 transition-colors">
                  Help
                </Link>
                <Link href="/track-order" className="hover:text-blue-200 transition-colors">
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SIBN Ecommerce</h1>
                <p className="text-xs text-gray-500">Your Marketplace</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Mobile */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                <Link href="/search">
                  <Search className="w-6 h-6" />
                </Link>
              </button>

              {/* Wishlist */}
              <div className="hidden sm:block">
                <WatchlistDrawer>
                  <button className="flex p-2 text-gray-600 hover:text-gray-900 relative">
                    <Heart className="w-6 h-6" />
                    {watchlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {watchlistCount}
                      </span>
                    )}
                  </button>
                </WatchlistDrawer>
              </div>

              {/* Account */}
              <div className="hidden sm:block">
                <AuthButton />
              </div>

              {/* Cart */}
              <CartDrawer>
                <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-900 relative">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="hidden sm:block text-sm">Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </CartDrawer>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden md:flex space-x-8 py-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>

              {/* Mobile Categories */}
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}

              {/* Mobile Account Links */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="py-2">
                  <AuthButton />
                </div>
                <Link
                  href="#"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <WatchlistDrawer>
                    <span>Watchlist ({watchlistCount})</span>
                  </WatchlistDrawer>
                </Link>
                <Link
                  href="/help"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help & Support
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}