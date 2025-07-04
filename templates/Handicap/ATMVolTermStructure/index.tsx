import React, { useState } from "react";
import Card from "@/components/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs, { Dayjs } from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { useATMVolTermStructureData } from "@/components/useATMVolTermStructureData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-700 dark:text-white text-sm font-semibold mb-2">期限: {label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">ATM IV:</span>
            <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>{payload[0].payload.atm}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-300">FWD IV:</span>
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>{payload[0].payload.fwd}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// 自定义底部Legend，始终显示所有按钮，变灰/高亮
function CustomLegend({ visible, onClick }: any) {
  const lines = [
    { key: 'atm', name: 'ATM IV', color: '#a78bfa' },
    { key: 'fwd', name: 'FWD IV', color: '#34d399' },
  ];
  
  return (
    <div className="flex flex-row justify-center items-center gap-4 mt-2 text-xs font-normal leading-tight flex-wrap">
      {lines.map(line => (
        <div
          key={line.key}
          className="flex items-center cursor-pointer select-none"
          onClick={() => onClick(line.key)}
        >
          <span
            className="inline-block mr-2"
            style={{
              width: 18,
              height: 2,
              background: visible[line.key] ? line.color : '#d1d5db',
              borderRadius: 2,
              transition: 'background 0.2s',
            }}
          />
          <span
            className={visible[line.key] ? '' : 'text-gray-400'}
            style={{ color: visible[line.key] ? line.color : '#d1d5db', fontWeight: visible[line.key] ? 400 : 400 }}
          >
            {line.name}
          </span>
        </div>
      ))}
    </div>
  );
}

const ATMVolTermStructure = ({ className }: { className?: string }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [visible, setVisible] = useState({ atm: true, fwd: true });
  const theme = useTheme();
  
  // 使用自定义Hook获取数据
  const { data, loading, error, refresh, updateDate } = useATMVolTermStructureData({
    symbol: 'BTC',
    date: selectedDate || undefined,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  // 当日期改变时更新数据
  React.useEffect(() => {
    if (selectedDate) {
      updateDate(selectedDate);
    }
  }, [selectedDate, updateDate]);

  const handleLegendClick = (key: string) => {
    setVisible(v => ({ ...v, [key as keyof typeof v]: !v[key as keyof typeof v] }));
  };

  return (
    <Card title="ATM波动率期限结构" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              format="YYYY-MM-DD"
              slots={{ openPickerIcon: CalendarMonthIcon }}
              slotProps={{
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    bgcolor: theme => theme.palette.mode === 'dark' ? '#23272b' : 'background.paper',
                    borderRadius: 2,
                    fontSize: 14,
                    height: 36,
                    minWidth: 160,
                    maxWidth: 180,
                    boxShadow: 2,
                    border: 'none',
                    outline: 'none',
                    '& .MuiOutlinedInput-root': {
                      border: 'none !important',
                      outline: 'none !important',
                      boxShadow: 2,
                      '&.Mui-focused': {
                        border: 'none !important',
                        outline: 'none !important',
                        boxShadow: 2,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none !important',
                    },
                    '& input': {
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    },
                    '&:hover': {
                      border: 'none',
                      outline: 'none',
                    },
                    '&.Mui-focused': {
                      border: 'none',
                      outline: 'none',
                    },
                    '& .MuiSvgIcon-root': {
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#23272b',
                    },
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      bgcolor: theme => theme.palette.mode === 'dark' ? '#23272b' : '#fff',
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : '#23272b',
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
        </div>
        <button 
          onClick={refresh}
          className="p-1 text-theme-secondary hover:text-theme-primary disabled:opacity-50"
          disabled={loading}
          title="刷新数据"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
          错误: {error}
        </div>
      )}
      <div className="h-64">
        {loading && !data.length ? (
          <div className="flex items-center justify-center h-full text-theme-secondary">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              加载中...
            </div>
          </div>
        ) : (
                      <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(111,118,126,0.3)" />
                <XAxis dataKey="term" tick={{ fontSize: 12, fill: '#6F767E' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6F767E' }} domain={[20, 50]} unit="%" interval={0} tickCount={7} ticks={[20,25,30,35,40,45,50]} />
                <Tooltip content={<CustomTooltip />} />
                <RechartsLegend
                  iconType="plainline"
                  wrapperStyle={{ fontSize: 12 }}
                  content={() => <CustomLegend visible={visible} onClick={handleLegendClick} />}
                />
                {visible.atm && (
                  <Line type="monotone" dataKey="atm" name="ATM IV" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, stroke: '#a78bfa', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                )}
                {visible.fwd && (
                  <Line type="monotone" dataKey="fwd" name="FWD IV" stroke="#34d399" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, stroke: '#34d399', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default ATMVolTermStructure; 