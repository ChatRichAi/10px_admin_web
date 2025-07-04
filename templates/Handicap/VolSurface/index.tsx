import React, { useState } from "react";
import Card from "@/components/Card";
import dynamic from "next/dynamic";
import { useVolSurfaceData } from "@/components/useVolSurfaceData";
import Plot from 'react-plotly.js';
import { useColorMode } from "@chakra-ui/react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// 定义数据类型
interface VolSurfaceData {
  xAxis: string[];
  yAxis: string[];
  zData: number[][];
}

// 默认模拟数据
const defaultData: VolSurfaceData = {
  xAxis: ['30JUN25', '23OCT25', '16FEB26', '12JUN26', '05OCT26'],
  yAxis: ['10P', '20P', '30C', '40C'],
  zData: [
    [30, 32, 35, 38],
    [31, 33, 36, 39],
    [33, 35, 38, 41],
    [36, 38, 41, 44],
    [38, 41, 44, 48],
  ],
};

const VolSurface = ({ className }: { className?: string }) => {
  const [symbol, setSymbol] = useState('BTC');
  
  // 使用自定义Hook获取数据
  const { data, loading, error, fetchData, refresh } = useVolSurfaceData(symbol, true, 5 * 60 * 1000);
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const axisColor = isDark ? "#fff" : "#222";
  const gridColor = isDark ? "#444" : "#e5e7eb";

  // 如果没有数据，显示加载状态
  if (!data) {
    return (
      <Card title="模型波动率平面" className={className}>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-theme-secondary">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      </Card>
    );
  }

  // 处理zData，确保无负值和null
  const zData = data.zData.map(row => row.map(z => z !== null && z >= 0 ? z : 0));
  const x = data.xAxis;
  const y = data.yAxis;

  return (
    <Card title="模型波动率平面" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            className="px-2 py-1 rounded text-sm border bg-theme-on-surface-1 text-theme-primary border-theme-stroke"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
          </select>
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
          {data.timestamp && (
            <div className="text-xs text-theme-tertiary">
              更新: {new Date(data.timestamp).toLocaleTimeString()}
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
      
      <div className="h-96 flex items-center justify-center">
        <Plot
          data={[
            {
              type: 'surface',
              x: x,
              y: y,
              z: zData,
              colorscale: [
                [0, '#3b82f6'],
                [0.5, '#fbbf24'],
                [1, '#ef4444']
              ],
              showscale: false,
              contours: { z: { show: false } },
              hoverinfo: 'x+y+z',
              hovertemplate: [
                '<b>到期日</b>: %{x}<br>',
                '<b>Delta</b>: %{y}<br>',
                '<b>波动率</b>: %{z:.2f}%<extra></extra>'
              ].join('')
            }
          ]}
          layout={{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: axisColor, family: 'inherit', size: 16 },
            hoverlabel: {
              bgcolor: '#23232b',
              bordercolor: '#3b82f6',
              font: { color: '#fff', size: 18, family: 'inherit' }
            },
            scene: {
              xaxis: {
                title: { text: '到期日', font: { color: axisColor, size: 40, family: 'inherit' } },
                tickmode: 'array',
                tickvals: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                ticktext: x.filter((_, i) => i % Math.ceil(x.length / 5) === 0),
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 22, color: axisColor, family: 'inherit' }
              },
              yaxis: {
                title: { text: 'Delta', font: { color: axisColor, size: 40, family: 'inherit' } },
                tickmode: 'array',
                tickvals: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                ticktext: y.filter((_, i) => i % Math.ceil(y.length / 3) === 0),
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 22, color: axisColor, family: 'inherit' }
              },
              zaxis: {
                title: { text: '波动率(%)', font: { color: axisColor, size: 40, family: 'inherit' } },
                color: axisColor,
                gridcolor: gridColor,
                gridwidth: 2,
                zerolinecolor: axisColor,
                zerolinewidth: 3,
                showbackground: false,
                tickfont: { size: 22, color: axisColor, family: 'inherit' }
              },
              bgcolor: 'rgba(0,0,0,0)'
            },
            margin: { l: 0, r: 0, b: 0, t: 0 }
          }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
          style={{ width: '90%', height: '90%' }}
        />
      </div>
    </Card>
  );
};

export default VolSurface; 