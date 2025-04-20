import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

const MaterialProduct = () => {
  // Get productId from URL and location state as fallback
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract productId from state if it exists there
  const stateProductId = location.state?.productId;
  const effectiveProductId = productId || stateProductId;
  
  // Log when the component mounts to verify the parameter
  useEffect(() => {
    console.log('MaterialProduct component mounted with productId:', effectiveProductId);
    console.log('Type of effectiveProductId:', typeof effectiveProductId);
  }, [effectiveProductId]);

  // State
  const [product, setProduct] = useState(null);
  const [productMaterials, setProductMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to check if a product matches our ID
  const isMatchingProduct = (product, targetId) => {
    if (!product || !targetId) return false;
    
    // Check against both id and uuid fields
    const productId = product.id ? String(product.id).trim() : null;
    const productUuid = product.uuid ? String(product.uuid).trim() : null;
    const targetIdStr = String(targetId).trim();
    
    return (productId === targetIdStr) || (productUuid === targetIdStr);
  };

  // Data Fetching
  const fetchProductData = useCallback(async () => {
    if (!effectiveProductId) {
      console.error('Product ID is missing in both URL parameters and location state');
      setError("Product ID is missing. Please select a product from the list.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Fetching product data for ID: ${effectiveProductId}`);
      
      // Since GET /products/{id} is not supported, we'll fetch all products
      // and filter for the one we want
      const response = await api.get('/products');
      console.log('Products API response:', response.data);
      
      if (!response.data?.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid data format received from API');
      }
      
      // Log some sample data for debugging
      if (response.data.data.length > 0) {
        console.log('First product structure:', response.data.data[0]);
      }
      
      // Find the specific product by ID - checking both id and uuid fields
      const fetchedProduct = response.data.data.find(p => isMatchingProduct(p, effectiveProductId));
      
      // Log all product IDs for debugging if product not found
      if (!fetchedProduct) {
        console.log('All products in response:', response.data.data);
        console.log('All product IDs in response:', response.data.data.map(p => p.id || p.uuid));
        throw new Error(`Product with ID ${effectiveProductId} not found`);
      }
      
      console.log('Found product:', fetchedProduct);
      
      // Set the product data
      setProduct({
        id: fetchedProduct.uuid || fetchedProduct.id, // Prefer uuid if available
        product_name: fetchedProduct.product_name,
        price: fetchedProduct.price,
        stock: fetchedProduct.stock,
        image: fetchedProduct.image || location.state?.image, // Fallback to image from state
      });
      
      // Map materials from backend format
      if (Array.isArray(fetchedProduct.materials)) {
        setProductMaterials(fetchedProduct.materials.map(material => ({
          id: material.id || material.uuid || material.material_id,
          name: material.material_name || material.name, // Handle different API response formats
          amount: material.amount_per_product,
          unit: material.weight_unit,
          available: material.available
        })));
      } else {
        setProductMaterials([]);
      }
      
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || err.message || 'Could not load product details.');
      setProduct(null);
      setProductMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveProductId, location.state]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Render loading state
  return (
    <div className="min-h-screen bg-slate-200 p-4 sm:p-6 lg:p-8">
      {/* If loading */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-[#86507B] text-4xl" />
            <p className="mt-3 text-gray-600">Loading Product Details...</p>
          </div>
        </div>
      )}

      {/* If error or no product */}
      {(!isLoading && (error || !product)) && (
        <div className="flex flex-col justify-center items-center min-h-[60vh] p-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Product</h2>
            <p className="text-red-700 bg-red-100 p-3 rounded mb-6">
              {error || "Product data could not be found."}
            </p>
            <button
              onClick={() => navigate('/product')}
              className="inline-flex items-center rounded-md border-2 border-[#86507B] bg-white px-4 py-2 text-sm font-medium text-[#86507B] shadow-sm hover:bg-[#f3e8f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B]"
            >
              <FaArrowLeft className="mr-2" /> Back to Products
            </button>
          </div>
        </div>
      )}

      {/* If product loaded successfully */}
      {(!isLoading && product) && (
        <div className="max-w-4xl mx-auto relative">
          {/* Back Button */}
          <div className="absolute -top-2 -left-4 sm:-left-10 lg:-left-16 mb-4 z-10">
            <button
              onClick={() => navigate('/product')}
              className="inline-flex items-center justify-center rounded-full border-2 border-[#86507B] bg-white p-2 text-sm font-medium text-[#86507B] shadow-md hover:bg-[#f3e8f0] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#86507B]"
              title="Back to Products list"
            >
              <FaArrowLeft className="h-4 w-4"/>
            </button>
          </div>

          {/* Product Header Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 text-center pt-10 sm:pt-6">
            <img
              src={product.image || '/placeholder-image.jpg'}
              alt={product.product_name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white ring-2 ring-[#f3e8f0]"
              onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{product.product_name}</h1>
            <p className="text-gray-600 mt-2">
              Price: <span className="font-medium text-[#6c4063]">Rp {Number(product.price || 0).toLocaleString("id-ID")}</span> |
              Stock: <span className="font-medium text-gray-700">{Number(product.stock || 0).toLocaleString("id-ID")}</span>
            </p>
          </div>

          {/* Materials List Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h2 className="text-xl font-semibold text-gray-700">Required Materials</h2>
            </div>
            <hr className="mb-4 border-gray-200" />

            {productMaterials.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No materials assigned to this product.</p>
            ) : (
              <ul className="space-y-3">
                {productMaterials.map((material) => (
                  <li key={material.id} className="p-3 rounded-md bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Material Name */}
                      <span className="font-medium text-gray-700 flex-shrink-0 mr-2">
                        {material.name || 'Unknown Material'}
                      </span>
                      {/* Material Quantity */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          ({material.amount} {material.unit})
                        </span>
                        {/* Available amount */}
                        <span className="text-xs text-gray-500">
                          Available: {material.available || 0} {material.unit}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialProduct;