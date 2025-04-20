import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaPlus, FaTrash, FaMinus, FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddProductModal from "../components/AddProductModal";
import api from "../services/api";
import "../components/Product.css";

// Modal Wrapper Component
const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 overflow-y-auto"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(2px)",
    }}
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
        style={{ animation: "modalAppear 0.2s ease-out" }}
      >
        {children}
      </div>
    </div>
  </div>
);

// AddStocks Modal Component (Replaces EditModal)
const AddStocksModal = ({ product, onSave, onCancel, isLoading }) => {
  const [stockToAdd, setStockToAdd] = useState("");
  const [error, setError] = useState("");

  // Handle stock change
  const handleStockChange = (e) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setStockToAdd(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      // Basic validation
      if (stockToAdd === "" || parseInt(stockToAdd) <= 0) {
        throw new Error("Please enter a valid positive number to add to stock");
      }
      
      // Calculate new stock level
      const currentStock = parseInt(product.stock) || 0;
      const addAmount = parseInt(stockToAdd);
      const newStock = currentStock + addAmount;
      
      // Create FormData for submission
      const productData = new FormData();
      productData.append("stock", newStock);
      
      console.log("Adding stocks:", {
        product_id: product.id,
        current_stock: currentStock,
        adding: addAmount,
        new_stock: newStock
      });
      
      await onSave(productData);
    } catch (error) {
      console.error("Validation failed:", error);
      setError(error.message);
    }
  };

  // Render the modal form
  return (
    <div className="bg-white p-6 border-2 border-[#86507B] rounded-lg">
      {/* Modal Header */}
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f3e8f0] sm:mx-0 sm:h-10 sm:w-10 border-2 border-[#86507B]">
          <FaBoxOpen className="h-5 w-5 text-[#86507B]" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
          <h3
            className="text-lg font-medium leading-6 text-[#86507B]"
            id="modal-title"
          >
            Add Stock
          </h3>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          {/* Product Info Display (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
              {product?.product_name || ""}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Price
              </label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
                Rp {Number(product?.price || 0).toLocaleString("id-ID")}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Stock
              </label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
                {Number(product?.stock || 0).toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Stock Addition Input */}
          <div>
            <label
              htmlFor="stockToAdd"
              className="block text-sm font-medium text-gray-700"
            >
              Stock to Add
            </label>
            <input
              type="number"
              name="stockToAdd"
              id="stockToAdd"
              value={stockToAdd}
              onChange={handleStockChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              min="1"
              step="1"
              placeholder="Enter amount to add"
              required
            />
          </div>

          {/* New Stock Preview */}
          {stockToAdd !== "" && parseInt(stockToAdd) >= 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <span className="font-medium">New Stock Total:</span>{" "}
                {Number(parseInt(product?.stock || 0) + parseInt(stockToAdd)).toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-[#86507B] hover:bg-[#6c4063] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#86507B] sm:ml-3 sm:w-auto transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaBoxOpen className="mr-2 h-4 w-4" />
                <span>Add Stock</span>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="mt-3 inline-flex w-full justify-center rounded-md border-2 border-[#86507B] bg-white px-4 py-2 text-sm font-medium text-[#86507B] shadow-sm hover:bg-[#f3e8f0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B] disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Delete Modal Component
const DeleteModal = ({ product, onConfirm, onCancel, isLoading }) => (
  <div className="bg-white p-6 rounded-lg">
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 border-2 border-red-600 mb-4">
        <FaTrash className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Are you sure you want to delete "{product?.product_name}"? This action
          cannot be undone.
        </p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border-2 border-gray-300 
            bg-white px-4 py-2 text-sm font-medium text-gray-700 
            hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-gray-500 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="inline-flex justify-center rounded-md px-4 py-2 text-sm 
            font-medium text-white bg-red-600 hover:bg-red-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 
            focus:ring-red-500 disabled:opacity-50 
            disabled:cursor-not-allowed border-2 border-red-600"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
              <span>Deleting...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <FaTrash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </div>
          )}
        </button>
      </div>
    </div>
  </div>
);

// Main Product Component
const Product = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [showModal, setShowModal] = useState(false);
  const [showAddStocksModal, setShowAddStocksModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const handleAddStocks = useCallback((product) => {
    // Line 281 (Corrected Check): Only check for the 'id' property which acts as the UUID
    if (!product?.id) {
      console.error("Invalid product data for stock update: Missing ID", product); // Updated log message
      setError("Cannot add stock: Product data is missing an identifier.");
      return;
    }
    // If the product has an ID, set it and show the modal
    setSelectedProduct(product);
    setShowAddStocksModal(true);
    setError(""); // Clear any previous invalid data error
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.data) {
        throw new Error("Invalid response format");
      }

      console.log("Products fetched:", response.data.data);
      setProducts(response.data.data);
      setError("");
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        setError("Please login to view products");
        // Optionally redirect to login page
        // navigate('/login');
      } else {
        setError("Failed to fetch products");
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add useEffect to call fetchProducts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add toast notification handler
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Handle add product
  const handleAddProduct = async (productData) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      console.log(
        "Creating new product with data:",
        Array.from(productData.entries())
      );

      await api.post("/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchProducts();
      setShowModal(false);
      showToast("Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "Failed to create product";
      showToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle save stock updates - Simplified to only update stock
  const handleSaveStocks = async (formDataFromModal) => {
        try {
          setActionLoading(true);
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found");
    
          // Ensure we have a selected product with an ID
          if (!selectedProduct || !selectedProduct.id) {
              console.error("Safeguard triggered: selectedProduct is null or missing ID during save", selectedProduct);
              throw new Error("Internal error: Product not selected for stock update.");
          }
    
          // Extract the new stock value from the FormData coming from the modal
          const newStockValue = formDataFromModal.get('stock');
          if (newStockValue === null || newStockValue === undefined) {
              throw new Error("New stock value not found in modal data");
          }
    
          // --- Create FormData with ALL fields, but add _method=PUT ---
          // Your backend PUT endpoint expects all product data for updates,
          // so we need to send the original data along with the updated stock.
          const updatedFormData = new FormData();
    
          // *** ADD THIS LINE *** This tells Laravel to treat the POST request as a PUT request.
          updatedFormData.append("_method", "PUT");
    
          // Append existing product data from the selected product state
          // The backend validation expects these fields if they are sent.
          updatedFormData.append("product_name", selectedProduct.product_name || '');
          updatedFormData.append("price", selectedProduct.price || 0);
    
          // Optional fields, only append if they have values
          if (selectedProduct.description) {
              updatedFormData.append("description", selectedProduct.description);
          }
          if (selectedProduct.category_id) {
              updatedFormData.append("category_id", selectedProduct.category_id);
          }
          // Note: We are NOT sending the image File object here, as we are only updating stock.
          // Your backend's 'sometimes|nullable|image' rule should handle this correctly
          // by keeping the existing image if no new file is sent.
    
          // Append the UPDATED stock value (This is the main purpose of this modal save)
          updatedFormData.append("stock", newStockValue);
    
          // Append materials as JSON string
          let materialsJsonString = '[]'; // Default to empty array JSON string
          // Check if materials exist and are not an empty array before stringifying
          if (selectedProduct.materials && selectedProduct.materials.length > 0) {
              const materialsArray = selectedProduct.materials.map(m => ({
                  // Map to the structure your backend materials validation and sync expects
                  material_id: m.material_id || m.id, // Use material_id from fetched data if available
                  amount_per_product: m.amount_per_product,
                  weight_unit: m.weight_unit
              }));
              materialsJsonString = JSON.stringify(materialsArray);
          }
          // Append the materials JSON string to the FormData
          updatedFormData.append("materials", materialsJsonString);
    
    
          // Safe Debug log (FormData content before sending)
          console.log("Actual FormData content before Sending (POST with _method=PUT):");
          for (let pair of updatedFormData.entries()) { console.log(pair[0]+ ': '+ pair[1]); }
    
    
          // --- CHANGE API CALL FROM api.put TO api.post ---
          // We send it as POST to allow FormData to be parsed correctly by the backend,
          // and use _method=PUT to tell Laravel the intended HTTP method.
          const response = await api.post(`/products/${selectedProduct.id}`, updatedFormData, {
            headers: {
              // "Content-Type": "multipart/form-data", // This header is typically set automatically by the browser for FormData POST
              Accept: "application/json", // We expect a JSON response back
              Authorization: `Bearer ${token}`, // Include your auth token
            },
          });
    
          // Check for specific success response structure if necessary
          if (response.data && response.data.success === false) {
               // If backend returns success: false, throw an error to trigger the catch block
               throw new Error(response.data.message || "Product update failed on server");
          }
    
          // Handle successful update
          console.log("Stock updated successfully:", response.data);
          await fetchProducts(); // Refresh the product list to show updated stock
          setShowAddStocksModal(false); // Close the modal
          setSelectedProduct(null); // Clear the selected product state
          showToast("Stock updated successfully", "success"); // Show success notification
          // No need to setError("") here, fetchProducts or the catch block handles errors
    
        } catch (error) { // This catch block handles API errors and validation errors returned from the backend
          console.error("Error updating stock:", error.response?.data || error);
    
          // Construct a user-friendly error message
          const errorMessage =
            error.response?.data?.message || error.message || "Failed to update stock";
    
          // If backend returned validation errors, you can access them here
          if (error.response?.data?.errors) {
             console.error("Validation Errors:", error.response.data.errors);
             // You could display these errors more specifically in the modal UI if you enhance it
             // For now, we set the general error message for the modal display
                 setError(errorMessage);
          } else {
                  // No specific validation errors, just a general error message
                  setError(errorMessage);
             }
    
          showToast(errorMessage, "error"); // Show error notification
        } finally {
          // Always set loading state to false after the API call is complete
          setActionLoading(false);
        }
      };

  // Handle delete product
  const handleDeleteProduct = async (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Make only one delete request
      const response = await api.delete(`/products/${productToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to delete product");
      }

      await fetchProducts();
      setShowDeleteModal(false);
      setProductToDelete(null);
      showToast("Product deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";
      showToast(errorMessage, "error");
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle image click
  const handleImageClick = useCallback(
    (product) => {
      if (!product?.id) return;
      navigate(`/product/${product.id}`, {
        state: {
          productId: product.id,
          image: product.image,
        },
      });
    },
    [navigate]
  );

  return (
    <div className="relative z-10 min-h-screen bg-slate-200">
      {/* Header section with consistent padding */}
      <div className="px-6 py-4 bg-slate-200">
        <h1 className="text-2xl font-bold hidden md:block">Product</h1>
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        {toast.show && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white transform transition-all duration-300 ease-in-out`}
          >
            {toast.message}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#86507B]"></div>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-100 rounded-lg shadow">
              <p className="text-xl text-gray-600 font-medium">
                No products found
              </p>
              <p className="text-gray-500 mt-2">
                Click the + button to add a new product
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white group hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden relative flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </div>
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className={`w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105 ${
                        product.stock === 0 ? "opacity-75" : ""
                      }`}
                      onClick={() => handleImageClick(product)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h2 className="text-lg font-semibold truncate group-hover:text-[#86507B] transition-colors">
                      {product.product_name}
                    </h2>
                    <p className="text-[#86507B] font-medium mt-1">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        product.stock === 0
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      Stock: {Number(product.stock).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => handleAddStocks(product)}
                      className="w-1/2 px-4 py-2 bg-white text-[#86507B] transition-all 
                    hover:bg-[#86507B] hover:text-white disabled:opacity-50 
                    disabled:cursor-not-allowed border-r border-gray-100
                    focus:outline-none group-hover:border-[#86507B]"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#86507B]"></div>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <FaBoxOpen /> Add Stock
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="w-1/2 px-4 py-2 bg-white text-red-600 transition-all
                    hover:bg-red-600 hover:text-white disabled:opacity-50 
                    disabled:cursor-not-allowed focus:outline-none"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <FaTrash /> Delete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-5 right-5 bg-[#86507B] text-white w-14 h-14 
          flex items-center justify-center rounded-full shadow-lg 
          hover:bg-[#6c4063] transition-colors duration-200 
          disabled:opacity-50 border-2 border-[#86507B]
          focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B] focus:outline-none"
        disabled={actionLoading}
      >
        {actionLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <FaPlus size={20} />
        )}
      </button>

      {showModal && (
        <ModalWrapper onClose={() => setShowModal(false)}>
          <AddProductModal
            showModal={showModal}
            setShowModal={setShowModal}
            addProduct={handleAddProduct}
            isLoading={actionLoading}
          />
        </ModalWrapper>
      )}

{showAddStocksModal && selectedProduct && ( // Keep this check - ensures selectedProduct is valid before rendering
        <ModalWrapper
            onClose={() => {
                // Prevent closing/canceling if action is in progress
                if (actionLoading) return;
                setShowAddStocksModal(false);
                setSelectedProduct(null);
                setError(""); // Good to clear error on modal close
            }}
        >
            <AddStocksModal
                product={selectedProduct}
                onSave={handleSaveStocks}
                onCancel={() => {
                    // Prevent closing/canceling if action is in progress
                    if (actionLoading) return;
                    setShowAddStocksModal(false);
                    setSelectedProduct(null);
                    setError("");
                }}
                isLoading={actionLoading} // Modal uses this to disable buttons
            />
        </ModalWrapper>
    )}

      {showDeleteModal && (
        <ModalWrapper
          onClose={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        >
          <DeleteModal
            product={productToDelete}
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setProductToDelete(null);
            }}
            isLoading={actionLoading}
          />
        </ModalWrapper>
      )}
    </div>
  );
};
export default Product;