import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import api from '../services/api';

const ProductList = () => {
  // State
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Data Fetching
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await api.get('/products');
        console.log('Products API response:', response.data);
        
        // Check if the response has the expected structure
        if (response.data && response.data.data) {
          // Log the first product to see its structure
          if (response.data.data.length > 0) {
            console.log('First product structure:', response.data.data[0]);
          }
          setProducts(response.data.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || err.message || 'Could not load products.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get the correct product ID property (either id or uuid)
  const getProductId = (product) => {
    // Check if product has uuid first, then fall back to id
    return product.uuid || product.id;
  };

  return (
    <div className="min-h-screen bg-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Search */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Products</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 py-2 w-full rounded-md border border-gray-300 focus:ring-[#86507B] focus:border-[#86507B]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-[#86507B] text-4xl" />
              <p className="mt-3 text-gray-600">Loading Products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {(!isLoading && error) && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Products</h2>
            <p className="text-red-700 bg-red-100 p-3 rounded">{error}</p>
          </div>
        )}

        {/* No Products State */}
        {(!isLoading && !error && filteredProducts.length === 0) && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">
              {searchTerm ? "No products match your search." : "No products available."}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {(!isLoading && !error && filteredProducts.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              // Get the appropriate ID for this product
              const productId = getProductId(product);
              
              return (
                <Link 
                  to={`/product/${productId}`} 
                  key={productId}
                  state={{ productId: productId, image: product.image }}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <img
                      src={product.image || '/placeholder-image.jpg'}
                      alt={product.product_name}
                      className="w-24 h-24 object-cover rounded-lg mb-3"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                    />
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{product.product_name}</h3>
                    <p className="text-[#86507B] font-medium">Rp {Number(product.price || 0).toLocaleString("id-ID")}</p>
                    <p className="text-gray-500 text-sm">Stock: {Number(product.stock || 0).toLocaleString("id-ID")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;