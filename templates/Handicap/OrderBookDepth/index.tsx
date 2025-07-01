import React from "react";
import Card from "@/components/Card";

// mock 数据
const bids = [
  { price: 34200, amount: 1.2 },
  { price: 34180, amount: 2.5 },
  { price: 34150, amount: 0.8 },
  { price: 34120, amount: 1.7 },
  { price: 34100, amount: 3.1 },
];
const asks = [
  { price: 34220, amount: 1.1 },
  { price: 34240, amount: 2.2 },
  { price: 34260, amount: 0.9 },
  { price: 34280, amount: 1.5 },
  { price: 34300, amount: 2.8 },
];

function getCumulative(list: { price: number; amount: number }[], reverse = false) {
  let sum = 0;
  return (reverse ? [...list].reverse() : list).map((item) => {
    sum += item.amount;
    return { ...item, cumulative: sum };
  });
}

const bidsWithCumulative = getCumulative(bids, true).reverse();
const asksWithCumulative = getCumulative(asks);

const OrderBookDepth = ({ className }: { className?: string }) => (
  <Card title="盘口信号" className={className}>
    <div>
      <div className="font-semibold mb-2 text-green-600 text-lg">买盘</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-theme-tertiary">
            <th className="font-normal text-right">价格</th>
            <th className="font-normal text-right">数量</th>
            <th className="font-normal text-right">累计</th>
          </tr>
        </thead>
        <tbody>
          {bidsWithCumulative.map((row, i) => (
            <tr key={i}>
              <td className="text-green-600 text-right font-medium">{row.price}</td>
              <td className="text-right">{row.amount}</td>
              <td className="text-right">{row.cumulative.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="my-4 border-t border-theme-stroke"></div>
    <div>
      <div className="font-semibold mb-2 text-red-600 text-lg">卖盘</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-theme-tertiary">
            <th className="font-normal text-right">价格</th>
            <th className="font-normal text-right">数量</th>
            <th className="font-normal text-right">累计</th>
          </tr>
        </thead>
        <tbody>
          {asksWithCumulative.map((row, i) => (
            <tr key={i}>
              <td className="text-red-600 text-right font-medium">{row.price}</td>
              <td className="text-right">{row.amount}</td>
              <td className="text-right">{row.cumulative.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export default OrderBookDepth; 