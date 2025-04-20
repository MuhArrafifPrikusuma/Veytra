import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Edit } from "lucide-react";
import api from "../services/api";

// Modal Wrapper Component
const ModalWrapper = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 z-50 overflow-y-auto"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(2px)'
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
        style={{
          animation: 'modalAppear 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const Material = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    material_name: "",
    price_per_unit: "",
    weight: "",
    weight_unit: "kg",
    measurement_type: "weight",
  });

  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API Calls and Handlers
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get("/materials");
      setMaterials(response.data.data || []);
      setError("");
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Please login to view materials");
      } else {
        setError("Failed to fetch materials");
      }
      console.error("Error:", error);
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMeasurementTypeChange = (e) => {
    const type = e.target.value;
    setFormData(prev => ({
      ...prev,
      measurement_type: type,
      weight_unit: type === "weight" ? "kg" : "l",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = {
        material_name: formData.material_name.trim(),
        price_per_unit: parseFloat(formData.price_per_unit),
        weight: parseFloat(formData.weight),
        weight_unit: formData.weight_unit,
      };

      await api.post("/materials", data);
      showToast("Material created successfully");
      fetchMaterials();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create material");
      showToast(error.response?.data?.message || "Failed to create material", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = {
        material_name: editingMaterial.material_name.trim(),
        price_per_unit: parseFloat(editingMaterial.price_per_unit),
        weight: parseFloat(editingMaterial.weight),
        weight_unit: editingMaterial.weight_unit,
      };

      await api.put(`/materials/${editingMaterial.id}`, data);
      showToast("Material updated successfully");
      fetchMaterials();
      setShowEditModal(false);
      setEditingMaterial(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update material");
      showToast(error.response?.data?.message || "Failed to update material", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await api.delete(`/materials/${id}`);
      showToast("Material deleted successfully");
      fetchMaterials();
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete material");
      showToast(error.response?.data?.message || "Failed to delete material", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (material) => {
    setEditingMaterial({
      id: material.id,
      material_name: material.material_name,
      price_per_unit: material.price_per_unit,
      weight: material.weight,
      weight_unit: material.weight_unit,
      measurement_type: ["ml", "l"].includes(material.weight_unit) ? "volume" : "weight",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (material) => {
    setItemToDelete(material);
    setShowDeleteConfirm(true);
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const resetForm = () => {
    setFormData({
      material_name: "",
      price_per_unit: "",
      weight: "",
      weight_unit: "kg",
      measurement_type: "weight",
    });
  };

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Materials</h1>
          {!isMobileView && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#86507B] text-white px-4 py-2 rounded-md hover:bg-[#6c4063] transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add Material
            </button>
          )}
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Desktop View */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#86507B]"></div>
                      </div>
                    </td>
                  </tr>
                ) : materials.length > 0 ? (
                  materials.map((material) => (
                    <tr key={material.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{material.material_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rp {Number(material.price_per_unit).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{`${material.weight} ${material.weight_unit}`}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleEditClick(material)} className="text-blue-600 hover:text-blue-900">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(material)} className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No materials found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#86507B]"></div>
              </div>
            ) : materials.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {materials.map((material) => (
                  <div key={material.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{material.material_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Rp {Number(material.price_per_unit).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {`${material.weight} ${material.weight_unit}`}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditClick(material)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(material)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No materials found
              </div>
            )}
          </div>
        </div>

        {/* Mobile Add Button (Fixed Position) */}
        {isMobileView && (
          <button
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#86507B] text-white rounded-full shadow-lg hover:bg-[#6c4063] transition-colors flex items-center justify-center"
            aria-label="Add material"
          >
            <Plus size={24} />
          </button>
        )}

        {/* Add Material Modal - Updated Styling */}
        {showAddModal && (
          <ModalWrapper onClose={() => setShowAddModal(false)}>
            <div className="bg-white p-6 border-2 border-[#86507B] rounded-lg">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f3e8f0] sm:mx-0 sm:h-10 sm:w-10 border-2 border-[#86507B]">
                  <Plus className="h-5 w-5 text-[#86507B]" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg font-medium leading-6 text-[#86507B]">
                    Add New Material
                  </h3>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="material_name" className="block text-sm font-medium text-gray-700">
                    Material Name
                  </label>
                  <input
                    type="text"
                    name="material_name"
                    id="material_name"
                    value={formData.material_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 
                      focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700">
                    Price per Unit
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      name="price_per_unit"
                      id="price_per_unit"
                      value={formData.price_per_unit}
                      onChange={handleInputChange}
                      className="pl-12 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="measurement_type" className="block text-sm font-medium text-gray-700">
                    Measurement Type
                  </label>
                  <select
                    name="measurement_type"
                    id="measurement_type"
                    value={formData.measurement_type}
                    onChange={handleMeasurementTypeChange}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 
                      focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <option value="weight">Weight</option>
                    <option value="volume">Volume</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="weight"
                      id="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      name="weight_unit"
                      id="weight_unit"
                      value={formData.weight_unit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {formData.measurement_type === 'weight' ? (
                        <>
                          <option value="mg">mg</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                        </>
                      ) : (
                        <>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
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
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Add Material</span>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
          </ModalWrapper>
        )}

        {/* Edit Material Modal - Updated Styling */}
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)}>
            <div className="bg-white p-6 border-2 border-[#86507B] rounded-lg">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f3e8f0] sm:mx-0 sm:h-10 sm:w-10 border-2 border-[#86507B]">
                  <Edit className="h-5 w-5 text-[#86507B]" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg font-medium leading-6 text-[#86507B]">
                    Edit Material
                  </h3>
                </div>
              </div>
              
              <form onSubmit={handleEdit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="edit_material_name" className="block text-sm font-medium text-gray-700">
                    Material Name
                  </label>
                  <input
                    type="text"
                    id="edit_material_name"
                    value={editingMaterial.material_name}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      material_name: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 
                      focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="edit_price_per_unit" className="block text-sm font-medium text-gray-700">
                    Price per Unit
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rp</span>
                    </div>
                    <input
                      type="number"
                      id="edit_price_per_unit"
                      value={editingMaterial.price_per_unit}
                      onChange={(e) => setEditingMaterial({
                        ...editingMaterial,
                        price_per_unit: e.target.value
                      })}
                      className="pl-12 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit_measurement_type" className="block text-sm font-medium text-gray-700">
                    Measurement Type
                  </label>
                  <select
                    id="edit_measurement_type"
                    value={editingMaterial.measurement_type}
                    onChange={(e) => setEditingMaterial({
                      ...editingMaterial,
                      measurement_type: e.target.value,
                      weight_unit: e.target.value === 'weight' ? 'kg' : 'l'
                    })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 
                      focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <option value="weight">Weight</option>
                    <option value="volume">Volume</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit_weight" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="edit_weight"
                      value={editingMaterial.weight}
                      onChange={(e) => setEditingMaterial({
                        ...editingMaterial,
                        weight: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="edit_weight_unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      id="edit_weight_unit"
                      value={editingMaterial.weight_unit}
                      onChange={(e) => setEditingMaterial({
                        ...editingMaterial,
                        weight_unit: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-300 
                        focus:border-[#86507B] focus:ring-[#86507B] sm:text-sm px-3 py-2
                        disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {editingMaterial.measurement_type === 'weight' ? (
                        <>
                          <option value="mg">mg</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                        </>
                      ) : (
                        <>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
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
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
          </ModalWrapper>
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ModalWrapper onClose={() => setShowDeleteConfirm(false)}>
          <div className="p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Delete Material</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this material? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
              <button
                onClick={() => handleDelete(itemToDelete.id)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Toast Notification */}
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
  </div>
  );
};

export default Material;