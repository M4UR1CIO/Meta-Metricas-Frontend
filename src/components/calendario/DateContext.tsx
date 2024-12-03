import React, { createContext, useState } from 'react';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });

  return (
    <DateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateContext.Provider>
  );
};
