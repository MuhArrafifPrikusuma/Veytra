import { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import api from "../services/api";

const AddProductModal = ({
  showModal,
  setShowModal,
  addProduct,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    stock: "",
    image: null,
    materials: [],
  });
  const [error, setError] = useState("");
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialAmount, setMaterialAmount] = useState("");
  const [materialUnit, setMaterialUnit] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get("/materials");
        // Ensure we're working with the data properly
        if (response.data?.data) {
          setAvailableMaterials(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      }
    };
    fetchMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleRemoveMaterial = (materialId) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== materialId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!formData.product_name.trim()) {
        throw new Error("Product name is required");
      }
      if (!formData.price || Number(formData.price) <= 0) {
        throw new Error("Valid price is required");
      }
      if (formData.stock === "" || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
        throw new Error("Stock quantity cannot be negative");
      }
      if (!formData.materials || formData.materials.length === 0) {
        throw new Error("At least one material is required");
      }
  
      const productData = new FormData();
      productData.append("product_name", formData.product_name.trim());
      productData.append("price", formData.price);
      productData.append("stock", formData.stock);
  
      if (formData.image) {
        productData.append("image", formData.image);
      }
  
      // Properly format materials data for Laravel
      // This may help fix the json_decode issue
      formData.materials.forEach((material, index) => {
        productData.append(`materials[${index}][id]`, material.id);
        productData.append(`materials[${index}][amount]`, material.amount);
        productData.append(`materials[${index}][unit]`, material.unit);
      });
      
      // Alternatively, if your backend expects a JSON string:
      // productData.append("materials", JSON.stringify(formData.materials));
  
      await addProduct(productData);
      setShowModal(false);
    } catch (error) {
      setError(error.message);
      console.error("Validation error:", error);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || !materialAmount || !materialUnit) {
      setError("All material fields are required");
      return;
    }

    const material = availableMaterials.find((m) => m.id === selectedMaterial);
    if (!material) {
      setError("Invalid material selected");
      return;
    }

    // Check if material already exists
    if (formData.materials.some((m) => m.id === material.id)) {
      setError("Material already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: material.id,
          name: material.material_name,
          amount: materialAmount,
          unit: materialUnit,
        },
      ],
    }));

    // Reset material form
    setSelectedMaterial("");
    setMaterialAmount("");
    setMaterialUnit("");
    setError("");
  };

  return (
    <div className="bg-white p-6 border-2 border-[#86507B] rounded-lg">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f3e8f0] sm:mx-0 sm:h-10 sm:w-10 border-2 border-[#86507B]">
          <FaPlus className="h-5 w-5 text-[#86507B]" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
          <h3 className="text-lg font-medium leading-6 text-[#86507B]">
            Add New Product
          </h3>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="product_name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              id="product_name"
              value={formData.product_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 
                focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 
                  focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 
                  focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Product Image (Optional)
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-2 file:border-[#86507B]
                file:text-sm file:font-semibold
                file:bg-white file:text-[#86507B]
                hover:file:bg-[#f3e8f0]
                disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Materials
            </h4>
            <div className="mb-4 space-y-2">
              {formData.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm">
                    {material.name} - {material.amount} {material.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaMinus size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="col-span-2 rounded-md border-2 border-gray-300 
                  focus:border-[#86507B] focus:ring-[#86507B] text-sm"
                disabled={isLoading}
              >
                <option value="">Select Material</option>
                {availableMaterials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.material_name}
                  </option>
                ))}
              </select>
              <div className="col-span-2 flex gap-2">
                <input
                  type="number"
                  value={materialAmount}
                  onChange={(e) => setMaterialAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-1/3 rounded-md border-2 border-gray-300 
                    focus:border-[#86507B] focus:ring-[#86507B] text-sm"
                  disabled={isLoading}
                  min="0"
                  step="0.01"
                />
                <select
                  value={materialUnit}
                  onChange={(e) => setMaterialUnit(e.target.value)}
                  className="w-1/3 rounded-md border-2 border-gray-300 
                    focus:border-[#86507B] focus:ring-[#86507B] text-sm"
                  disabled={isLoading}
                >
                  <option value="">Unit</option>
                  <option value="g">Gram (g)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="l">Liter (l)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  disabled={
                    !selectedMaterial ||
                    !materialAmount ||
                    !materialUnit ||
                    isLoading
                  }
                  className="w-1/3 px-4 py-2 bg-[#86507B] text-white rounded-md hover:bg-[#6c4063]
                    disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                >
                  <FaPlus className="mr-2" size={12} />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm 
              font-medium text-white bg-[#86507B] hover:bg-[#6c4063] 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B]
              disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#86507B]
              sm:ml-3 sm:w-auto transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaPlus className="mr-2 h-4 w-4" />
                <span>Add Product</span>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
            className="mt-3 inline-flex w-full justify-center rounded-md border-2
              border-[#86507B] bg-white px-4 py-2 text-sm font-medium
              text-[#86507B] shadow-sm hover:bg-[#f3e8f0] focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-[#86507B]
              disabled:opacity-50 disabled:cursor-not-allowed
              sm:mt-0 sm:w-auto transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductModal;