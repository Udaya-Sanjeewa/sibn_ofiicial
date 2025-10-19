'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Heart, Star, MapPin, Clock, Eye, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { WatchlistButton } from '@/components/watchlist/WatchlistButton';

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

export function ProductGrid({ products, viewMode = 'grid' }: ProductGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
          <Eye className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
    }>
      {products.map((product) => (
        <div
          key={product.id}
          className={
            viewMode === 'grid'
              ? "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
              : "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 flex"
          }
        >
          <Link href={`/product/${product.id}`} className="contents">
            {/* Product Image */}
            <div className={
              viewMode === 'grid'
                ? "relative aspect-[4/3] overflow-hidden"
                : "relative w-48 h-36 overflow-hidden flex-shrink-0"
            }>
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isFeatured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-semibold">
                    Featured
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-semibold">
                    New
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  {product.condition}
                </Badge>
              </div>

              {/* Favorite Button */}
              <div className="absolute top-3 right-3">
                <WatchlistButton
                  product={product}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                />
              </div>

              {/* Image Count */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {product.images.length}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5 flex-1">
              {/* Title & Price */}
              <div className="mb-3">
                <h3 className={
                  viewMode === 'grid'
                    ? "font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2"
                    : "font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-2"
                }>
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={
                    viewMode === 'grid' ? "text-2xl font-bold text-blue-600" : "text-3xl font-bold text-blue-600"
                  }>
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className={
                viewMode === 'grid'
                  ? "text-gray-600 text-sm line-clamp-2 mb-3"
                  : "text-gray-600 text-base line-clamp-3 mb-4"
              }>
                {product.description}
              </p>

              {/* Seller Info */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {product.seller.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm text-gray-900">
                        {product.seller.name}
                      </span>
                      <BadgeCheck className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">{product.seller.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Time */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(product.createdAt)}</span>
                </div>
              </div>

              {/* Features */}
              {product.features.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {product.features.slice(0, viewMode === 'grid' ? 2 : 4).map((feature, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-blue-200 text-blue-700"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > (viewMode === 'grid' ? 2 : 4) && (
                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                      +{product.features.length - (viewMode === 'grid' ? 2 : 4)} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Add to Cart Button */}
              <div className={
                viewMode === 'grid'
                  ? "pt-3 border-t border-gray-100"
                  : "pt-4 border-t border-gray-100"
              }>
                <AddToCartButton 
                  product={product} 
                  size={viewMode === 'grid' ? 'sm' : 'default'}
                  className="w-full"
                />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}