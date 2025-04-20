import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Minus,
  ChevronLeft,
  ChevronRight,
  Edit as Pencil, // Using Edit icon alias
  Calendar as CalendarIcon,
  Loader2, // Spinner icon
  X as FaTimes, // Using X for close icon
} from "lucide-react";
import api from "../services/api"; // Import your API service instance

// --- Helper Function ---
// Formats JS Date to 'YYYY-MM-DD' for API

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

const formatDateForAPI = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    // Ensure UTC date to avoid timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    // Return in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date for API:", e);
    return "";
  }
};

// Formats API date 'YYYY-MM-DD' back to locale string for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  try {
    // Adding T00:00:00 helps parse the date consistently as UTC start of day
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;
    // toLocaleDateString with these options ONLY requests date parts
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }); // e.g., 04/08/25
  } catch (e) {
    console.error("Error formatting date for display:", e);
    return dateString;
  }
};

// --- Calendar Component ---
const Calendar = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      days.push(
        <button
          key={day}
          onClick={() => {
            onDateSelect(date);
            onClose();
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
            isSelected ? "bg-[#6b4078] text-white" : "hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-64 border border-gray-200 z-50">
      {" "}
      {/* Added z-index */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft size={20} />
        </button>
        <div className="font-medium">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{generateDays()}</div>
    </div>
  );
};
// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({ onClose, sale, onConfirm, isDeleting }) => (
  <div className="bg-white p-6 rounded-lg">
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 border-2 border-red-600 mb-4">
        <Trash2 className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Delete Sale</h3>
      <div className="mt-2 px-7 py-3">
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this sale? This action cannot be
          undone.
        </p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          {sale?.product?.product_name} (Qty: {sale?.quantity})
        </p>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span>Deleting...</span>
            </div>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- Edit Balance Modal ---
const EditBalanceModal = ({
  onClose,
  currentBalance,
  onConfirm,
  isLoading,
  setTempBalance,
}) => (
  <div className="bg-white p-6 rounded-lg">
    <h3 className="text-lg font-medium text-[#86507B] mb-4">Edit Balance</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Balance
        </label>
        <input
          type="number"
          value={currentBalance}
          onChange={(e) => setTempBalance(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 border-2 p-2 
            focus:border-[#86507B] focus:ring-[#86507B]"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#86507B] text-white rounded-md hover:bg-[#734869]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span>Saving...</span>
            </div>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- Main Sales Component ---
const Sales = () => {
  // API Data State
  const [salesList, setSalesList] = useState([]);
  const [productsForSale, setProductsForSale] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0); // Initialize balance at 0

  // UI State
  const [isLoading, setIsLoading] = useState(true); // Overall initial loading
  const [error, setError] = useState(""); // General errors
  const [isSubmitting, setIsSubmitting] = useState(false); // For Add Sale API call
  const [isDeleting, setIsDeleting] = useState(null); // Store ID of sale being deleted
  const [isBalanceLoading, setIsBalanceLoading] = useState(true); // Specific loading for balance fetch
  const [isBalanceSaving, setIsBalanceSaving] = useState(false); // Specific saving state for balance update
  const [balanceError, setBalanceError] = useState(""); // Specific errors for balance actions

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [tempBalance, setTempBalance] = useState(""); // For Edit Balance modal input

  // Form State (Add Modal)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newSale, setNewSale] = useState({
    product_id: "",
    quantity: 1,
    description: "",
  });
  const [selectedProductInfo, setSelectedProductInfo] = useState(null); // Used in Add Modal

  // --- Data Fetching Callbacks ---
  const fetchSales = useCallback(async () => {
    console.log("Fetching sales...");
    try {
      const response = await api.get("/sales"); // API CALL
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const sortedSales = response.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setSalesList(sortedSales);
      } else {
        console.warn("Failed to fetch sales or invalid format:", response.data);
        setError((prev) => prev || "Could not load sales list.");
        setSalesList([]);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch sales data."
      );
      setSalesList([]);
    }
  }, []);

  const fetchProductsForSale = useCallback(async () => {
    console.log("Fetching products for sale...");
    try {
      const response = await api.get("/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.data?.data) {
        // Keep all products, including those with 0 stock
        setProductsForSale(response.data.data);
      } else {
        console.warn("Failed to fetch products:", response.data);
        setProductsForSale([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
      setProductsForSale([]);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    console.log("Fetching balance...");
    setIsBalanceLoading(true);
    setBalanceError("");
    try {
      const response = await api.get("/balance"); // API CALL
      if (
        response.data?.success &&
        typeof response.data?.data?.balance === "number"
      ) {
        setTotalBalance(response.data.data.balance);
      } else {
        console.warn(
          "Failed to fetch balance or invalid format:",
          response.data
        );
        setBalanceError("Could not load current balance.");
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalanceError(
        err.response?.data?.message || err.message || "Failed to fetch balance."
      );
    } finally {
      setIsBalanceLoading(false);
    }
  }, []);

  // --- Initial Data Load Effect ---
  useEffect(() => {
    setIsLoading(true);
    setError("");
    Promise.all([fetchSales(), fetchProductsForSale(), fetchBalance()]).finally(
      () => setIsLoading(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --- Add Sale Modal Handlers ---
  const handleProductSelectionChange = (e) => {
    const productId = e.target.value;
    const productInfo =
      productsForSale.find((p) => String(p.id) === String(productId)) || null;
    setSelectedProductInfo(productInfo); // Store selected product details (price, stock)
    setNewSale((prev) => ({
      ...prev,
      product_id: productId,
      quantity: 1, // Reset quantity when product changes
    }));
    setError(""); // Clear general errors when changing product
  };

  const handleQuantityChange = (increment) => {
    setNewSale((prevState) => {
      const currentQuantity = prevState.quantity;
      let newQuantity = currentQuantity + increment;
      newQuantity = Math.max(1, newQuantity); // Min quantity is 1
      // Use selectedProductInfo which was stored when product was selected
      if (selectedProductInfo && newQuantity > selectedProductInfo.stock) {
        newQuantity = selectedProductInfo.stock; // Cap at available stock
        setError(
          `Quantity cannot exceed available stock (${selectedProductInfo.stock}).`
        ); // Show error
      } else {
        setError(""); // Clear error if quantity is valid
      }
      return { ...prevState, quantity: newQuantity };
    });
  };

  const calculateTotalPrice = () => {
    if (!selectedProductInfo) return 0;
    return (
      (Number(selectedProductInfo.price) || 0) * (Number(newSale.quantity) || 0)
    );
  };

  const handleAddSubmit = async () => {
    // Re-verify selection and stock just before submit
    if (!newSale.product_id || !selectedProductInfo) {
      setError("Please select a product.");
      return;
    }
    const currentSelectedProduct = productsForSale.find(
      (p) => String(p.id) === String(newSale.product_id)
    );
    if (!currentSelectedProduct) {
      setError("Selected product data is missing.");
      return;
    }
    if (newSale.quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    if (newSale.quantity > currentSelectedProduct.stock) {
      setError(
        `Quantity cannot exceed available stock (${currentSelectedProduct.stock}).`
      );
      return;
    }

    const formattedDate = formatDateForAPI(selectedDate);
    if (!formattedDate) {
      setError("Invalid date selected");
      return;
    }

    const payload = {
      product_id: newSale.product_id,
      quantity: newSale.quantity,
      description: newSale.description || null,
      date: formattedDate, // Use formatted date
    };
    console.log("Submitting new sale:", payload);
    try {
      const response = await api.post("/sales", payload); // API CALL
      if (response.data?.success) {
        setShowAddModal(false);
        setNewSale({ product_id: "", quantity: 1, description: "" });
        setSelectedDate(new Date());
        setSelectedProductInfo(null);
        setIsLoading(true); // Show loading while refetching
        Promise.all([
          fetchSales(),
          fetchProductsForSale(),
          fetchBalance(),
        ]).finally(() => setIsLoading(false));
        // TODO: Show success toast
      } else {
        throw new Error(response.data?.message || "Failed to create sale.");
      }
    } catch (err) {
      console.error("Error creating sale:", err);
      setError(
        err.response?.data?.message || err.message || "Could not create sale."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Sale Handlers ---
  const handleDeleteClick = (saleItem) => {
    if (isDeleting) return;
    setItemToDelete(saleItem);
    setShowDeleteConfirm(true);
  };
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || isDeleting) return;
    setIsDeleting(itemToDelete.id);
    setError("");
    console.log("Deleting sale:", itemToDelete.id);
    try {
      const response = await api.delete(`/sales/${itemToDelete.id}`); // API CALL
      if (response.data?.success) {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setIsLoading(true);
        Promise.all([
          fetchSales(),
          fetchProductsForSale(),
          fetchBalance(),
        ]).finally(() => setIsLoading(false));
        // TODO: Show success toast
      } else {
        throw new Error(response.data?.message || "Failed to delete sale.");
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
      setError(
        err.response?.data?.message || err.message || "Could not delete sale."
      );
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Balance Edit Handlers ---
  const handleEditBalance = () => {
    setTempBalance(totalBalance.toString()); // Use current balance
    setBalanceError("");
    setShowEditBalanceModal(true);
  };

  const handleConfirmBalance = async () => {
    if (isBalanceSaving) return;
    const newBalance = parseFloat(tempBalance.replace(/\D/g, "")) || 0;
    setIsBalanceSaving(true);
    setBalanceError("");
    console.log("Attempting to update balance to:", newBalance);
    try {
      const payload = { balance: newBalance };
      const response = await api.put("/balance", payload); // API CALL
      if (
        response.data?.success &&
        typeof response.data?.data?.balance === "number"
      ) {
        setTotalBalance(response.data.data.balance); // Update state from response
        setShowEditBalanceModal(false);
        // TODO: Show success toast
      } else {
        throw new Error(response.data?.message || "Failed to update balance.");
      }
    } catch (err) {
      console.error("Error updating balance:", err);
      setBalanceError(
        err.response?.data?.message ||
          err.message ||
          "Could not update balance."
      );
      // Keep modal open
    } finally {
      setIsBalanceSaving(false);
    }
  };

  // --- Components ---

  // Total Balance Component (With Loading)
  const TotalBalanceComponent = () => (
    /* ... (JSX from previous response) ... */
    <div className="bg-white rounded-lg shadow-md p-4 w-full md:w-auto md:min-w-[250px]">
      <h2 className="text-gray-600 text-sm mb-2">Total Balance</h2>
      <div className="flex items-center gap-2">
        {isBalanceLoading ? (
          <Loader2 className="animate-spin text-[#6b4078]" size={24} />
        ) : (
          <p className="text-2xl font-bold text-[#6b4078]">
            {" "}
            Rp {totalBalance.toLocaleString()}{" "}
          </p>
        )}
        <button
          onClick={handleEditBalance}
          className={`text-gray-400 transition ${
            isBalanceLoading || isBalanceSaving
              ? "opacity-50 cursor-not-allowed"
              : "hover:text-[#6b4078]"
          }`}
          disabled={isBalanceLoading || isBalanceSaving}
          aria-label="Edit Balance"
        >
          {" "}
          <Pencil size={16} />{" "}
        </button>
      </div>
      {balanceError && !showEditBalanceModal && (
        <p className="text-xs text-red-600 mt-1">{balanceError}</p>
      )}
    </div>
  );

  // Add Modal Component
  const AddModal = ({ onClose }) => {
    return (
      <div className="bg-white p-6 border-2 border-[#86507B] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[#86507B]">Add New Sale</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Date Input */}
          <div className="relative">
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Date
            </label>
            <div className="flex items-center border rounded focus-within:ring-1 focus-within:ring-[#86507B] focus-within:border-[#86507B]">
              <input
                type="text"
                readOnly
                value={selectedDate.toLocaleDateString()}
                className="w-full p-2 bg-transparent cursor-default focus:outline-none"
                onClick={() =>
                  !isSubmitting && setShowCalendar((prev) => !prev)
                }
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() =>
                  !isSubmitting && setShowCalendar((prev) => !prev)
                }
                className="p-2 text-gray-500 hover:text-[#86507B]"
                disabled={isSubmitting}
              >
                <CalendarIcon size={18} />
              </button>
            </div>
            {showCalendar && (
              <div className="absolute top-full left-0 mt-1 z-[100]">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Product
            </label>
            <select
              value={newSale.product_id}
              onChange={handleProductSelectionChange}
              className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#86507B] focus:border-[#86507B]"
              disabled={isSubmitting || !productsForSale.length}
            >
              <option value="">Select a product</option>
              {productsForSale.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={product.stock === 0}
                  className={product.stock === 0 ? "text-red-500" : ""}
                >
                  {product.product_name}{" "}
                  {product.stock === 0
                    ? "- SOLD OUT"
                    : `(Stock: ${product.stock})`}
                </option>
              ))}
            </select>
            {selectedProductInfo && (
              <div className="space-y-1 mt-1">
                <p className="text-xs text-gray-500">
                  Price per unit: Rp{" "}
                  {Number(selectedProductInfo.price).toLocaleString()}
                </p>
                {selectedProductInfo.stock === 0 && (
                  <p className="text-xs text-red-500 font-medium">
                    This product is currently out of stock
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={newSale.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                const maxStock = selectedProductInfo?.stock ?? 0;
                if (val > maxStock) {
                  setError(
                    `Quantity cannot exceed available stock (${maxStock}).`
                  );
                } else if (val < 1) {
                  setError("Quantity must be at least 1.");
                } else {
                  setError("");
                }
                setNewSale((prev) => ({
                  ...prev,
                  quantity: Math.max(0, Math.min(val, maxStock)),
                }));
              }}
              className="w-full p-2 border rounded-md focus:ring-1 focus:ring-[#86507B] focus:border-[#86507B]"
              min="1"
              max={selectedProductInfo?.stock}
              disabled={isSubmitting}
              placeholder="Enter quantity"
            />
            {selectedProductInfo && (
              <p className="text-xs text-gray-500 mt-1">
                Available stock: {selectedProductInfo.stock}
              </p>
            )}
          </div>
          {/* Description Input */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              value={newSale.description}
              onChange={(e) =>
                setNewSale((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full p-2 border rounded resize-none"
              rows="2"
              disabled={isSubmitting}
              placeholder="Add any notes about this sale"
            />
          </div>

          {/* Total Price Display */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Total Price
            </label>
            <span className="text-lg font-semibold text-[#86507B]">
              Rp {calculateTotalPrice().toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSubmit}
              disabled={
                isSubmitting || !newSale.product_id || newSale.quantity < 1
              }
              className="px-4 py-2 text-white bg-[#86507B] rounded-md hover:bg-[#734869] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Sale"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal

  // --- Main Render ---
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-200">
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-[#6b4078] font-bold text-2xl">Sales</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <TotalBalanceComponent /> {/* Balance Display/Edit */}
            <button
              className="fixed bottom-6 right-6 bg-[#6b4078] text-white p-4 rounded-full shadow-lg hover:bg-[#5a3366] transition"
              onClick={() => setShowAddModal(true)}
              disabled={isLoading}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Display Loading or Error for the main list */}
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            {" "}
            <Loader2 className="animate-spin text-[#6b4078]" size={32} />{" "}
            <span className="ml-3 text-gray-600">Loading data...</span>{" "}
          </div>
        )}
        {error && !isLoading && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md shadow">
            {error}
          </div>
        )}

        {/* Sales List - Desktop Table */}
        <section
          className={`hidden md:block bg-white shadow-md rounded-md overflow-hidden ${
            isLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <h2 className="text-[#6b4078] font-semibold p-4 border-b text-lg">
            Sales History
          </h2>
          {!isLoading && salesList.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              {" "}
              <p>No sales recorded yet.</p>{" "}
            </div>
          )}
          {salesList.length > 0 && (
            <div className="overflow-x-auto">
              {/* Ensure no extra spaces/newlines between these tags */}
              <table className="w-full min-w-[700px]">
                <thead>
                  {" "}
                  {/* Must immediately follow <table> or other valid table elements */}
                  <tr className="bg-gray-200 text-gray-700 text-sm uppercase">
                    <th className="py-3 px-4 text-left font-medium">Product</th>
                    <th className="py-3 px-4 text-center font-medium">
                      Quantity
                    </th>
                    <th className="py-3 px-4 text-right font-medium">
                      Total Price
                    </th>
                    <th className="py-3 px-4 text-center font-medium">Date</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Description
                    </th>
                    <th className="py-3 px-4 text-center font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                {/* Must immediately follow <thead> */}
                <tbody>
                  {salesList.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className={`text-sm ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-purple-50`}
                    >
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        {item.product?.product_name || (
                          <span className="text-gray-400 italic">
                            Product Removed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-green-700 font-medium text-right">
                        +Rp {Number(item.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-center">
                        {formatDateForDisplay(item.date)}
                      </td>
                      <td
                        className="py-3 px-4 text-gray-500 text-xs truncate max-w-[200px]"
                        title={item.description}
                      >
                        {item.description || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className={`text-red-600 hover:text-red-800 transition ${
                              isDeleting === item.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() => handleDeleteClick(item)}
                            disabled={isDeleting === item.id || !!isDeleting}
                            aria-label="Delete Sale"
                          >
                            {isDeleting === item.id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Must immediately follow <tbody> */}
              </table>
            </div>
          )}
          <div className="p-4 border-t bg-gray-50">
            {" "}
            <p className="text-xs text-gray-500">
              {" "}
              Showing {salesList.length} sales records{" "}
            </p>{" "}
          </div>
        </section>

        {/* Sales List - Mobile Cards */}
        <div
          className={`md:hidden space-y-3 ${
            isLoading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {!isLoading && salesList.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {" "}
              No sales recorded yet.{" "}
            </div>
          )}
          {salesList.length > 0 &&
            salesList.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-md shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-800">
                      {item.product?.product_name || (
                        <span className="text-gray-400 italic">
                          Product Removed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      Rp {Number(item.total_amount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`p-1 ${
                        isDeleting === item.id
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-800 transition"
                      }`}
                      onClick={() => handleDeleteClick(item)}
                      disabled={isDeleting === item.id || !!isDeleting}
                      aria-label="Delete Sale"
                    >
                      {isDeleting === item.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 border-t pt-2">
                  <span>Quantity: {item.quantity}</span>
                  <span>Date: {formatDateForDisplay(item.date)}</span>
                </div>
                {item.description && (
                  <p
                    className="text-xs text-gray-500 mt-1 truncate"
                    title={item.description}
                  >
                    Note: {item.description}
                  </p>
                )}
              </div>
            ))}
        </div>

        {/* Modals */}
        {showAddModal && (
          <ModalWrapper onClose={() => setShowAddModal(false)}>
            <AddModal
              onClose={() => setShowAddModal(false)}
              isSubmitting={isSubmitting}
              error={error}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
              newSale={newSale}
              setNewSale={setNewSale}
              handleProductSelectionChange={handleProductSelectionChange}
              handleQuantityChange={handleQuantityChange}
              calculateTotalPrice={calculateTotalPrice}
              handleAddSubmit={handleAddSubmit}
              productsForSale={productsForSale}
              selectedProductInfo={selectedProductInfo}
            />
          </ModalWrapper>
        )}

        {showEditBalanceModal && (
          <ModalWrapper
            onClose={() => !isBalanceSaving && setShowEditBalanceModal(false)}
          >
            <EditBalanceModal
              onClose={() => !isBalanceSaving && setShowEditBalanceModal(false)}
              currentBalance={tempBalance}
              onConfirm={handleConfirmBalance}
              isLoading={isBalanceSaving}
              setTempBalance={setTempBalance} // Pass the setter function
            />
          </ModalWrapper>
        )}
        {showDeleteConfirm && (
          <ModalWrapper onClose={() => setShowDeleteConfirm(false)}>
            <DeleteConfirmModal
              onClose={() => setShowDeleteConfirm(false)}
              sale={itemToDelete}
              onConfirm={handleConfirmDelete}
              isDeleting={isDeleting}
            />
          </ModalWrapper>
        )}

        {/* Mobile Add Button */}
        <button
          className="fixed bottom-6 right-6 bg-[#6b4078] text-white p-4 rounded-full shadow-lg hover:bg-[#5a3366] transition md:hidden z-30"
          onClick={() => setShowAddModal(true)}
          disabled={isLoading}
        >
          <Plus size={24} />
        </button>
      </main>
    </div>
  );
};

export default Sales;
