// components/Filters.tsx - اصلاح شده با sync state
import React, { useEffect } from 'react';
import { Filter } from 'lucide-react';
import CustomSelect from './CustomSelect';
import DateRangePicker from './DateRangePicker';

interface FilterTab {
  key: string;
  label: string;
  mobileLabel?: string;
}

interface SelectConfig {
  key: string;
  label: string;
  options: string[];
  defaultValue: string;
  width?: string;
}




interface FilterConfig {
  tabs: FilterTab[];
  defaultTab: string;
  selects: SelectConfig[];
  hasDateRange?: boolean;
  showActiveFilters?: boolean;
  showResultsSummary?: boolean;
  styles?: {
    container?: string;
    tabActive?: string;
    tabInactive?: string;
    activeFilterBadge?: string;
  };
}

interface FiltersProps {
  config: FilterConfig;
  onFilterChange: (filters: any) => void;
  sidebarCollapsed?: boolean;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  selectedFilters?: Record<string, string>;
  dateFrom?: string;
  dateTo?: string;
  onTabChange?: (tab: string) => void;
  onSelectChange?: (key: string, value: string) => void;
  onDateChange?: (from: string, to: string) => void;
  onClearFilters?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  config,
  onFilterChange,
  sidebarCollapsed = false,
  selectedFilters = {},
  dateFrom = '',
  dateTo = '',
  onTabChange,
  onSelectChange,
  onDateChange,
  onClearFilters
}) => {
  const [activeTab, setActiveTab] = React.useState(config.defaultTab);
  const [selectValues, setSelectValues] = React.useState<Record<string, string>>(
    config.selects.reduce((acc, select) => ({
      ...acc,
      [select.key]: selectedFilters[select.key] || select.defaultValue
    }), {})
  );
  const [dateFromState, setDateFromState] = React.useState(dateFrom);
  const [dateToState, setDateToState] = React.useState(dateTo);

  // Sync with props when they change
  useEffect(() => {
    setSelectValues(prev => {
      const newValues = { ...prev };
      let changed = false;
      
      config.selects.forEach(select => {
        if (selectedFilters[select.key] && selectedFilters[select.key] !== prev[select.key]) {
          newValues[select.key] = selectedFilters[select.key];
          changed = true;
        }
      });
      
      return changed ? newValues : prev;
    });
  }, [selectedFilters, config.selects]);

  useEffect(() => {
    if (dateFrom !== dateFromState) {
      setDateFromState(dateFrom);
    }
    if (dateTo !== dateToState) {
      setDateToState(dateTo);
    }
  }, [dateFrom, dateTo]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    if (onTabChange) {
      onTabChange(tabKey);
    }
    onFilterChange({
      tab: tabKey,
      selects: selectValues,
      dateFrom: dateFromState,
      dateTo: dateToState
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    const newValues = { ...selectValues, [key]: value };
    setSelectValues(newValues);
    if (onSelectChange) {
      onSelectChange(key, value);
    }
    onFilterChange({
      tab: activeTab,
      selects: newValues,
      dateFrom: dateFromState,
      dateTo: dateToState
    });
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFromState(from);
    setDateToState(to);
    if (onDateChange) {
      onDateChange(from, to);
    }
    onFilterChange({
      tab: activeTab,
      selects: selectValues,
      dateFrom: from,
      dateTo: to
    });
  };

  const handleClearFilters = () => {
    setActiveTab(config.defaultTab);
    const defaultSelectValues = config.selects.reduce((acc, select) => ({
      ...acc,
      [select.key]: select.defaultValue
    }), {});
    
    setSelectValues(defaultSelectValues);
    setDateFromState('');
    setDateToState('');
    
    if (onClearFilters) {
      onClearFilters();
    }
    
    onFilterChange({
      tab: config.defaultTab,
      selects: defaultSelectValues,
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = 
    activeTab !== config.defaultTab ||
    Object.values(selectValues).some((value, index) => 
      value !== config.selects[index]?.defaultValue
    ) ||
    dateFromState ||
    dateToState;

  // تنظیمات استایل‌ها بر اساس کد شما
  const getTabLabel = (tab: FilterTab) => {
    if (!tab.mobileLabel) return tab.label;
    
    const mobileLabel = tab.mobileLabel;
    if (mobileLabel === "Up") return "Upcoming";
    if (mobileLabel === "Sched") return "Scheduled";
    if (mobileLabel === "Done") return "Completed";
    if (mobileLabel === "Cancel") return "Canceled";
    return mobileLabel;
  };

  const getMobileTabLabel = (tab: FilterTab) => {
    return tab.mobileLabel || tab.label;
  };

  return (
    <div className="bg-white rounded shadow-md border border-gray-200 p-3 lg:p-5 lg:px-2 mb-6">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {/* Filter Tabs - Mobile */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Status Filter:
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {config.tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`px-2.5 py-1.5 rounded-lg transition-all duration-200 
                    font-medium text-xs whitespace-nowrap flex-1 min-w-[60px] ${
                    activeTab === tab.key
                      ? "bg-[#019586a6] text-white border border-teal-500 shadow-sm"
                      : "text-gray-600 hover:text-teal-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => handleTabChange(tab.key)}
                  title={getTabLabel(tab)}
                >
                  {getMobileTabLabel(tab)}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters - Stack on mobile */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {config.selects.map((select) => (
                <CustomSelect
                  key={select.key}
                  selected={selectValues[select.key]}
                  setSelected={(value) => handleSelectChange(select.key, value)}
                  options={select.options}
                  width="w-full"
                  variant="minimal"
                  upArrow={false}
                  downArrow={true}
                  className="text-sm"
                />
              ))}

              {config.hasDateRange && (
                <DateRangePicker
                  dateFrom={dateFromState}
                  dateTo={dateToState}
                  setDateFrom={(value) => handleDateChange(value, dateToState)}
                  setDateTo={(value) => handleDateChange(dateFromState, value)}
                  variant="minimal"
                  width="w-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className={`flex flex-col justify-between ${
          sidebarCollapsed ? "flex-row" : "lg:flex-col xl:flex-row"
        } items-center gap-3 w-full min-w-0`}>
          
          {/* Status Filters */}
          <div className="min-w-0">
            <div className="flex flex-nowrap p-1.5 gap-1">
              {config.tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    whitespace-nowrap rounded-lg font-medium
                    transition-all duration-200
                    px-4 py-2
                    lg:text-[14px]
                    xl:text-[16px]
                    flex-shrink-0
                    ${activeTab === tab.key
                      ? "bg-white text-teal-600 shadow-sm shadow-[#016d635a]"
                      : "text-gray-600 hover:text-teal-600 hover:bg-white/50"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select Filters */}
          <div className="flex-shrink-0 min-w-0">
            <div className="flex flex-nowrap items-center gap-2 min-w-0">
              {config.selects.map((select, index) => (
                <div
                  key={select.key}
                  className={`
                    flex-shrink
                    ${sidebarCollapsed
                      ? index === 0 
                        ? "min-w-[9.2rem] max-w-[8rem]" 
                        : "min-w-[5rem] max-w-[8rem]"
                      : index === 0
                        ? "lg:w-full xl:min-w-[4.2rem] xl:max-w-[10rem] 2xl:min-w-[8.2rem]"
                        : "lg:w-full xl:min-w-[5rem] xl:max-w-[6rem]"
                    }
                  `}
                >
                  <CustomSelect
                    selected={selectValues[select.key]}
                    setSelected={(value) => handleSelectChange(select.key, value)}
                    options={select.options}
                    width="w-full"
                    variant="minimal"
                    upArrow={false}
                    downArrow={true}
                  />
                </div>
              ))}

              {config.hasDateRange && (
                <div className={`flex-shrink-0 ${
                  sidebarCollapsed
                    ? "min-w-[6.5rem] lg:max-w-[6.5rem] xl:max-w-[12.5rem]"
                    : "xl:min-w-[6.5rem] xl:max-w-[5.5rem] 2xl:max-w-[12.5rem]"
                }`}>
                  <DateRangePicker
                    dateFrom={dateFromState}
                    dateTo={dateToState}
                    setDateFrom={(value) => handleDateChange(value, dateToState)}
                    setDateTo={(value) => handleDateChange(dateFromState, value)}
                    variant="minimal"
                    width="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {config.showActiveFilters && hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="md:hidden">
            <div className="flex items-start gap-2">
              <span className="text-xs text-gray-500 pt-0.5">✓</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Active filters:</div>
                <div className="flex flex-wrap gap-1">
                  {activeTab !== config.defaultTab && (
                    <span className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded inline-flex items-center">
                      {config.tabs.find(t => t.key === activeTab)?.label}
                      <button className="ml-1 text-teal-600" onClick={() => handleTabChange(config.defaultTab)}>
                        ×
                      </button>
                    </span>
                  )}

                  {config.selects.map((select) => (
                    selectValues[select.key] !== select.defaultValue && (
                      <span key={select.key} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded inline-flex items-center">
                        {selectValues[select.key]}
                        <button className="ml-1 text-blue-600" onClick={() => handleSelectChange(select.key, select.defaultValue)}>
                          ×
                        </button>
                      </span>
                    )
                  ))}

                  {(dateFromState || dateToState) && (
                    <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded inline-flex items-center">
                      {dateFromState && dateToState ? "Date Range" : "Date"}
                      <button className="ml-1 text-purple-600" onClick={() => handleDateChange('', '')}>
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs text-teal-600 hover:text-teal-800 font-medium px-2"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Filters applied:</span>
              {activeTab !== config.defaultTab && (
                <span className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded">
                  {config.tabs.find(t => t.key === activeTab)?.label}
                </span>
              )}
              {config.selects.map((select) => (
                selectValues[select.key] !== select.defaultValue && (
                  <span key={select.key} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {selectValues[select.key]}
                  </span>
                )
              ))}
              {(dateFromState || dateToState) && (
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  {dateFromState && dateToState ? `${dateFromState} - ${dateToState}` : dateFromState || dateToState}
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-400 hover:text-teal-600 ml-2"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;