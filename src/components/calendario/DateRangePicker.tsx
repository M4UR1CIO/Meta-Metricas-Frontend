import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDateContext } from './useDateContext';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';

const DateRangePicker: React.FC = () => {
  const { dateRange, setDateRange } = useDateContext();
  
  const defaultEndDate = new Date();
  const defaultStartDate = subDays(defaultEndDate, 27);
  
  const [startDate, setStartDate] = useState<Date | null>(dateRange.startDate || defaultStartDate);
  const [endDate, setEndDate] = useState<Date | null>(dateRange.endDate || defaultEndDate);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const adjustedStartDate = subDays(startDate, 0);
      setDateRange({ startDate: adjustedStartDate, endDate });
    }
  }, [startDate, endDate, setDateRange]);

  const formattedDateRange = startDate && endDate
    ? `${format(startDate, 'dd MMM yyyy', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
    : 'Seleccionar Fechas';

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 mr-2 sm:mr-3 border border-gray-300 rounded-xl text-gray-700 bg-blue-50 hover:bg-gray-200 active:bg-gray-300 transition duration-200 flex items-center "
      >
        <FaCalendarAlt className="text-black sm:text-lg md:text-xl text-3xl mr-0 sm:mr-2" /> 
        <span className="hidden sm:block">{formattedDateRange}</span>
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 1000 }}>
          <DatePicker
            selected={startDate}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              setStartDate(start);
              setEndDate(end);
              if (start && end) {
                setIsOpen(false);
              }
            }}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
            selectsRange
            inline
            openToDate={endDate || startDate || undefined}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
