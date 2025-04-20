import { useState, useEffect, useRef } from "react";
import "../components/Reports.css"; // Impor CSS khusus
import { BsGraphDownArrow, BsFilterRight } from "react-icons/bs"; // Ikon untuk Profit/Loss dan Filter
import { GiProfit, GiExpense } from "react-icons/gi"; // Ikon untuk Income dan Expense
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Reports = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const datePickerRef = useRef(null);
  const filterPopupRef = useRef(null);

  const [cardsData, setCardsData] = useState([
    {
      label: "Profit/Loss",
      date: "12/01/2025",
      value: "-Rp 400.000",
      className: "card-loss",
      icon: <BsGraphDownArrow className="card-icon" />,
    },
    {
      label: "Income",
      date: "12/01/2025",
      value: "Rp 400.000",
      className: "card-income",
      icon: <GiProfit className="card-icon" />,
    },
    {
      label: "Total Expense",
      date: "12/01/2025",
      value: "Rp 800.000",
      className: "card-expense",
      icon: <GiExpense className="card-icon" />,
    },
  ]);

  const salesData = [
    { no: 1, date: "01-07 January 2025", total: "Rp. 200.000" },
    { no: 2, date: "08-14 January 2025", total: "Rp. 200.000" },
    { no: 3, date: "14-21 January 2025", total: "Rp. 200.000" },
    { no: 4, date: "28-31 January 2025", total: "Rp. 200.000" },
  ];

  const handleDateClick = (index) => {
    setActiveCardIndex(index);
    setIsDatePickerOpen(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
    const formattedDate = date.toLocaleDateString("en-GB");
    setCardsData((prevCardsData) =>
      prevCardsData.map((card, index) =>
        index === activeCardIndex ? { ...card, date: formattedDate } : card
      )
    );
  };

  const handleClickOutside = (event) => {
    if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
      setIsDatePickerOpen(false);
    }
    if (filterPopupRef.current && !filterPopupRef.current.contains(event.target)) {
      setIsFilterPopupOpen(false);
    }
  };

  useEffect(() => {
    if (isDatePickerOpen || isFilterPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen, isFilterPopupOpen]);

  const handleFilterClick = () => {
    setIsFilterPopupOpen(!isFilterPopupOpen);
  };

  return (
    <div className="reports-container">
      <h1 className="reports-title">Reports</h1>

      {/* Cards Section */}
      <div className="cards-container">
        {cardsData.map((card, index) => (
          <div className={`card ${card.className}`} key={index}>
            <div className="card-content">
              <div className="card-text">
                <p className="card-label">{card.label}</p>
                <p className="card-date" onClick={() => handleDateClick(index)}>{card.date}</p>
              </div>
              <div className="card-icon-container">{card.icon}</div>
            </div>
            <hr className="card-separator" />
            <div className="card-value-container">
              <p className="card-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Table Section */}
      <div className="sales-header">
        <h2 className="sales-title">Total Sales</h2>
        <div className="filter-icon-container">
          <BsFilterRight className="filter-icon" onClick={handleFilterClick} />
          {isFilterPopupOpen && (
            <div className="filter-popup" ref={filterPopupRef}>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                showMonthYearPicker
                calendarClassName="custom-calendar"
              />
            </div>
          )}
        </div>
      </div>
      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Dates per weeks</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item) => (
              <tr key={item.no}>
                <td>{item.no}</td>
                <td>{item.date}</td>
                <td>{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Date Picker Pop-up */}
      {isDatePickerOpen && (
        <div className="date-picker-popup" ref={datePickerRef}>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            calendarClassName="custom-calendar"
          />
        </div>
      )}
    </div>
  );
};

export default Reports;