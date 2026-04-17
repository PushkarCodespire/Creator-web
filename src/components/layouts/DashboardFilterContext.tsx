import { createContext, useContext, useState } from 'react';

interface FilterContextType {
  period: string;
  setPeriod: (p: string) => void;
  days: number;
}

const FilterContext = createContext<FilterContextType>({ period: '90D', setPeriod: () => {}, days: 90 });

export function useDashboardFilter() {
  return useContext(FilterContext);
}

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState('90D');
  const days = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  return (
    <FilterContext.Provider value={{ period, setPeriod, days }}>
      {children}
    </FilterContext.Provider>
  );
}
