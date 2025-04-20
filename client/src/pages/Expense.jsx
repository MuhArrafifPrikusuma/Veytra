import  { useState, } from 'react';
import { 
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Minus,
} from 'lucide-react';

const DatePicker = ({ selectedDate, onDateSelect, onClose }) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  };
  
  const initialDate = parseDate(selectedDate);
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );
  const [selected, setSelected] = useState(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelected(newDate);
    onDateSelect(formatDate(newDate));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    let firstDayOfMonth = getFirstDayOfMonth(year, month);
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const weeks = [];
    let days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="p-0 text-center w-8"></td>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selected.getDate() === day && 
                      selected.getMonth() === month && 
                      selected.getFullYear() === year;
      
      days.push(
        <td key={day} className="p-0 text-center w-8 h-8">
          <button 
            onClick={() => handleDateClick(day)}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm
              ${isSelected ? 'bg-[#6d4e77] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
          >
            {day}
          </button>
        </td>
      );
      
      if ((firstDayOfMonth + day) % 7 === 0) {
        weeks.push(<tr key={`week-${day}`}>{days}</tr>);
        days = [];
      }
    }
    
    if (days.length > 0) {
      const remainingCells = 7 - days.length;
      for (let i = 0; i < remainingCells; i++) {
        days.push(<td key={`empty-end-${i}`} className="p-0 text-center w-8"></td>);
      }
      weeks.push(<tr key="last-week">{days}</tr>);
    }
    
    return weeks;
  };

  const getFormattedMonth = () => {
    if (isNaN(currentMonth.getTime())) {
      return "Desember 2024";
    }
    return currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium text-lg text-gray-800">
          {getFormattedMonth()}
        </h2>
        <div className="flex space-x-1">
          <button 
            onClick={prevMonth}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Mo</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Tu</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">We</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Th</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Fr</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Sa</th>
            <th className="text-xs text-gray-500 font-normal w-8 h-6">Su</th>
          </tr>
        </thead>
        <tbody>
          {renderCalendar()}
        </tbody>
      </table>
    </div>
  );
};

const Expense = () => {
  const [expenseList, setExpenseList] = useState([
    { no: 1, name: 'Gas LPG', item: 3, totalPrice: 'Rp 63.000', category: 'Operating Cost', dates: '12/01/25' },
    { no: 2, name: 'Tepung Terigu', item: 3, totalPrice: 'Rp 33.300', category: 'Material Cost', dates: '12/01/25' },
    { no: 3, name: 'Tepung Maizena', item: 2, totalPrice: 'Rp 18.500', category: 'Material Cost', dates: '12/01/25' },
    { no: 4, name: 'Plastik Kemasan', item: 5, totalPrice: 'Rp 25.000', category: 'Operating Cost', dates: '12/01/25' },
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);
  const [tempBalance, setTempBalance] = useState('');
  const [totalBalance, setTotalBalance] = useState(2000000);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [newExpense, setNewExpense] = useState({
    dates: '12/01/25',
    name: '',
    item: 3,
    price: '',
    category: '',
    totalPrice: '-'
  });
  
  const [showCashFlowDropdown, setShowCashFlowDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const shouldEnableScroll = expenseList.length > 4;
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleEditBalance = () => {
    setTempBalance(totalBalance.toString());
    setShowEditBalanceModal(true);
  };

  const handleConfirmBalance = () => {
    const newBalance = parseInt(tempBalance) || 0;
    setTotalBalance(newBalance);
    setShowEditBalanceModal(false);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      const updatedList = expenseList.filter(item => item.no !== itemToDelete.no);
      setExpenseList(updatedList);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleAddExpenseClick = () => {
    setNewExpense({
      dates: '12/01/25',
      name: '',
      item: 3,
      price: '',
      category: '',
      totalPrice: '-'
    });
    setIsEditing(false);
    setShowAddExpenseModal(true);
  };

  const handleNewExpenseChange = (field, value) => {
    setNewExpense({
      ...newExpense,
      [field]: value
    });

    if (field === 'item' || field === 'price') {
      const item = field === 'item' ? value : newExpense.item;
      const price = field === 'price' ? value : newExpense.price;
      
      if (item && price) {
        const numericPrice = parseInt(price.replace(/\D/g, '')) || 0;
        const numericItem = parseInt(item) || 0;
        const total = numericPrice * numericItem;
        
        setNewExpense({
          ...newExpense,
          [field]: value,
          totalPrice: `Rp ${total.toLocaleString('id-ID')}`
        });
      }
    }
  };

  const handleConfirmAddExpense = () => {
    if (!newExpense.name || !newExpense.category) {
      return;
    }

    if (isEditing && expenseToEdit) {
      const updatedList = expenseList.map(expense =>
        expense.no === expenseToEdit.no ? {
          ...expense,
          name: newExpense.name,
          item: newExpense.item,
          totalPrice: newExpense.totalPrice === '-' ? 'Rp 0' : newExpense.totalPrice,
          category: newExpense.category,
          dates: newExpense.dates
        } : expense
      );
      setExpenseList(updatedList);
      setIsEditing(false);
      setExpenseToEdit(null);
    } else {
      const newItem = {
        no: expenseList.length > 0 ? Math.max(...expenseList.map(item => item.no)) + 1 : 1,
        name: newExpense.name,
        item: newExpense.item,
        totalPrice: newExpense.totalPrice === '-' ? 'Rp 0' : newExpense.totalPrice,
        category: newExpense.category,
        dates: newExpense.dates
      };
      setExpenseList([...expenseList, newItem]);
    }

    setShowAddExpenseModal(false);

    if (newExpense.totalPrice !== '-') {
      const expenseAmount = parseInt(newExpense.totalPrice.replace(/\D/g, '')) || 0;
      setTotalBalance(prevBalance => prevBalance - expenseAmount);
    }
  };

  const handleCancelAddExpense = () => {
    setShowAddExpenseModal(false);
    setShowDatePicker(false);
    setIsEditing(false);
    setExpenseToEdit(null);
  };

  const handleItemIncrement = () => {
    const newItem = parseInt(newExpense.item) + 1 || 1;
    handleNewExpenseChange('item', newItem);
  };

  const handleItemDecrement = () => {
    const currentItem = parseInt(newExpense.item) || 0;
    if (currentItem > 1) {
      const newItem = currentItem - 1;
      handleNewExpenseChange('item', newItem);
    }
  };

  const handleCategorySelect = (category) => {
    handleNewExpenseChange('category', category);
    setShowCategoryDropdown(false);
  };

  const handleDateSelect = (date) => {
    handleNewExpenseChange('dates', date);
    setShowDatePicker(false);
  };

  const handleEditClick = (expense) => {
    setExpenseToEdit(expense);
    setNewExpense({
      dates: expense.dates,
      name: expense.name,
      item: expense.item,
      price: expense.totalPrice.replace(/\D/g, ''), 
      category: expense.category,
      totalPrice: expense.totalPrice
    });
    setIsEditing(true);
    setShowAddExpenseModal(true);
  };

  const TotalBalanceComponent = () => (
    <div className="bg-white rounded-lg shadow-md p-4 w-full md:w-64">
      <h2 className="text-gray-600 text-sm mb-2">Total Balance</h2>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-[#6b4078]">
          Rp {totalBalance.toLocaleString()}
        </p>
        <button 
          onClick={handleEditBalance}
          className="text-gray-400 hover:text-[#6b4078] transition"
        >
          <Pencil size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <main className="flex-1 bg-[#f8f8f8] overflow-auto relative">
        <div className="hidden md:flex justify-between items-center p-6">
          <h1 className="text-[#6b4078] font-bold text-2xl mb-6">Expense</h1>
        </div>
        
        <div className="md:hidden px-4 py-2">
          <TotalBalanceComponent />
        </div>
        
        <div className="hidden md:block px-6 py-4">
          <TotalBalanceComponent />
        </div>
        
        <div className="hidden md:flex justify-between items-center p-6 pt-0">
          <div className="flex gap-3">
          </div>
          <button 
            className="ml-3 bg-[#6b4078] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#5a3366] transition"
            onClick={handleAddExpenseClick}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>

        <section className="hidden md:block bg-white shadow-md rounded-md overflow-hidden mx-6">
          <h2 className="text-[#6b4078] font-semibold p-4 border-b">Expense List</h2>
          {expenseList.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              <p className="text-xl">No expenses found</p>
            </div>
          )}
          {expenseList.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 text-center">No</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-center">Total Item</th>
                  <th className="py-3 px-4 text-left">Total Price</th>
                  <th className="py-3 px-4 text-left">Dates</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenseList.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <td className="py-3 px-4 text-center">{item.no}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-center">{item.item}</td>
                    <td className="py-3 px-4 text-red-500 font-medium">-{item.totalPrice}</td>
                    <td className="py-3 px-4">{item.dates}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          className="text-green-600 hover:text-green-800 transition"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {expenseList.length} items
            </p>
          </div>
        </section>

        <div className="md:hidden p-2">
          {expenseList.length > 0 ? (
            expenseList.map((item, index) => (
              <div key={index} className="bg-white p-3 mb-2 rounded-md shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="font-bold">{item.name}</div>
                  <div className="flex gap-2">
                    <button 
                      className="text-green-600 hover:text-green-800 transition"
                      onClick={() => handleEditClick(item)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                                            className="text-red-600 hover:text-red-800 transition"
                                            onClick={() => handleDeleteClick(item)}
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex mt-1 gap-1 text-sm text-gray-600">
                                        <div className="text-red-500 font-medium">-{item.totalPrice}</div>
                                        <div className="mx-1">•</div>
                                        <div>Item: {item.item}</div>
                                        <div className="mx-1">•</div>
                                        <div>Dates: {item.dates}</div>
                                        <div className="mx-1">•</div>
                                        <div>Category: {item.category}</div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center text-gray-500 py-8">
                                    No expenses found
                                  </div>
                                )}
                              </div>
                      
                              {showAddExpenseModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                  <div 
                                    className="fixed inset-0 - bg-opacity-50 backdrop-blur-sm"
                                    onClick={handleCancelAddExpense}
                                  />
                                  
                                  <div className="relative bg-white rounded-lg shadow-xl w-80 z-50">
                                    <div className="p-4">
                                      <div className="flex flex-col space-y-4">
                      
                                        <div className="flex justify-between items-center relative">
                                          <label className="font-medium text-sm">Dates:</label>
                                          <span 
                                            className="text-sm cursor-pointer hover:text-[#6d4e77]"
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                          >
                                            {newExpense.dates}
                                          </span>
                                          
                                          
                                          {showDatePicker && (
                                            <div className="absolute top-8 right-0 z-50">
                                              <DatePicker 
                                                selectedDate={newExpense.dates}
                                                onDateSelect={handleDateSelect}
                                                onClose={() => setShowDatePicker(false)}
                                              />
                                            </div>
                                          )}
                                        </div>
                      
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Name:</label>
                                          <input
                                            type="text"
                                            value={newExpense.name}
                                            onChange={(e) => handleNewExpenseChange('name', e.target.value)}
                                            className="w-full p-2 bg-gray-200 border-none rounded-md focus:outline-none"
                                            placeholder="Enter expense name"
                                          />
                                        </div>
                      
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Total Item:</label>
                                          <div className="flex items-center">
                                            <button 
                                              onClick={handleItemDecrement}
                                              className="p-1 border border-gray-300 rounded-l-md"
                                            >
                                              <Minus size={12} />
                                            </button>
                                            <input
                                              type="text"
                                              value={newExpense.item}
                                              onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                handleNewExpenseChange('item', value ? parseInt(value) : '');
                                              }}
                                              className="w-10 p-1 border-y text-center focus:outline-none"
                                            />
                                            <button 
                                              onClick={handleItemIncrement}
                                              className="p-1 border border-gray-300 rounded-r-md"
                                            >
                                              <Plus size={12} />
                                            </button>
                                          </div>
                                        </div>
                      
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Price:</label>
                                          <input
                                            type="text"
                                            value={newExpense.price}
                                            onChange={(e) => {
                                              const value = e.target.value.replace(/\D/g, '');
                                              handleNewExpenseChange('price', value);
                                            }}
                                            className="w-full p-2 bg-gray-200 border-none rounded-md focus:outline-none"
                                            placeholder="Enter price"
                                          />
                                        </div>
                      
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Category:</label>
                                          <div className="relative">
                                            <button 
                                              className="w-full p-2 bg-gray-200 rounded-md text-left flex justify-between items-center"
                                              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                            >
                                              <span className="text-sm">{newExpense.category || 'Select category'}</span>
                                              <span>▼</span>
                                            </button>
                                            
                                            {showCategoryDropdown && (
                                              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                                <ul>
                                                  <li 
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                                                    onClick={() => handleCategorySelect('Operating Cost')}
                                                  >
                                                    Operating Cost
                                                  </li>
                                                  <li 
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onClick={() => handleCategorySelect('Material Cost')}
                                                  >
                                                    Material Cost
                                                  </li>
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                      
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Total Price:</label>
                                          <div className="py-2 text-sm text-red-500 font-medium">
                                            {newExpense.totalPrice}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4 p-2 flex justify-between">
                                      <button
                                        onClick={handleCancelAddExpense}
                                        className="px-5 py-2 bg-[#6d4e77] text-white rounded-md hover:bg-[#5a3366] transition font-medium w-32"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleConfirmAddExpense}
                                        className="px-5 py-2 bg-[#6d4e77] text-white rounded-md hover:bg-[#5a3366] transition font-medium w-32"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                      
                              {showEditBalanceModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                  <div 
                                    className="fixed inset-0  bg-opacity-50 backdrop-blur-sm"
                                    onClick={() => setShowEditBalanceModal(false)}
                                  />
                                  <div className="relative bg-white rounded-lg shadow-xl w-80 z-50">
                                    <div className="p-4">
                                      <div className="flex flex-col space-y-4">
                                        <div>
                                          <label className="block font-medium text-sm mb-1">Edit Balance:</label>
                                          <input
                                            type="text"
                                            value={tempBalance}
                                            onChange={(e) => setTempBalance(e.target.value)}
                                            className="w-full p-2 bg-gray-200 border-none rounded-md focus:outline-none"
                                            placeholder="Enter new balance"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 p-2 flex justify-between">
                                      <button
                                        onClick={() => setShowEditBalanceModal(false)}
                                        className="px-5 py-2 bg-[#6d4e77] text-white rounded-md hover:bg-[#5a3366] transition font-medium w-32"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleConfirmBalance}
                                        className="px-5 py-2 bg-[#6d4e77] text-white rounded-md hover:bg-[#5a3366] transition font-medium w-32"
                                      >
                                        Confirm
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                      
                              {showDeleteConfirm && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                  <div 
                                    className="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-40"
                                    onClick={handleCancelDelete}
                                  />
                                  
                                  <div className="z-50 bg-white rounded-lg shadow-xl w-96 border border-gray-200">
                                    <div className="p-5 border-b">
                                      <h3 className="text-xl font-medium text-center text-[#6b4078]">Konfirmasi Hapus</h3>
                                    </div>
                                    
                                    <div className="p-6">
                                      <p className="text-center text-gray-700 text-lg mb-2">
                                        Apakah Anda yakin ingin menghapus ini?
                                      </p>
                                      <p className="text-center text-[#6b4078] font-medium">
                                        {itemToDelete?.name}
                                      </p>
                                    </div>
                                    
                                    <div className="p-4 flex justify-center gap-4 border-t bg-gray-50 rounded-b-lg">
                                      <button
                                        onClick={handleCancelDelete}
                                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        onClick={handleConfirmDelete}
                                        className="px-6 py-2 bg-[#6b4078] text-white rounded-md hover:bg-[#5a3366] transition font-medium active:bg-[#4a2856] focus:outline-none focus:ring-2 focus:ring-[#6b4078] focus:ring-opacity-50"
                                        type="button"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                      
                              <button 
                                className="fixed bottom-6 right-6 bg-[#6b4078] text-white p-4 rounded-full shadow-lg hover:bg-[#5a3366] transition md:hidden"
                                onClick={handleAddExpenseClick}
                              >
                                <Plus size={24} />
                              </button>
                            </main>
                          </div>
                        );
                      };
                      
                      export default Expense;