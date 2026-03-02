'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { polarClient } from '@/utils/polar-client';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [products, setProducts] = useState({ result: { items: [] } });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await polarClient.getProducts({ isArchived: false });
        setProducts(data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.result.items.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
            {product.description && (
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            )}
            
            {/* Price Display */}
            {product.prices && product.prices.length > 0 && (
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${(product.prices[0].price_amount / 100).toFixed(2)}
                </span>
                <span className="text-gray-500 ml-1">
                  {product.prices[0].price_currency}
                </span>
              </div>
            )}

            {/* Checkout Options */}
            <div className="space-y-2">
              {/* Regular Checkout (Redirect) */}
              <Link
                href={`/checkout?productId=${product.id}${user?.email ? `&customerEmail=${encodeURIComponent(user.email)}` : ''}`}
                className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Buy Now (Redirect)
              </Link>
              
              {/* Embedded Checkout */}
              <Link
                href={`/checkout/embed?productId=${product.id}&productName=${encodeURIComponent(product.name)}${product.prices && product.prices.length > 0 ? `&amount=${(product.prices[0].price_amount / 100).toFixed(2)}&currency=${product.prices[0].price_currency}` : ''}`}
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Buy Now (Embedded)
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}