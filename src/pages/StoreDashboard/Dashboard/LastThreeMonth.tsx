import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  CalendarCheck,
} from "lucide-react";
import { useState } from "react";

export default function LastThreeMonth() {
  const [chartView, setChartView] = useState("amount");

  const topSellers = [
    { name: "Champignonrahm Schnitzel", amount: "€2,641.80", sold: 152, width: "100%" },
    { name: "Cordon Bleu", amount: "€2,285.00", sold: 120, width: "85%" },
    { name: "Schnitzel TV 1873 Hausen", amount: "€1,861.80", sold: 102, width: "70%" },
    { name: "Helles", amount: "€1,741.50", sold: 438, width: "65%" },
    { name: "Pfefferrahm Schnitzel", amount: "€1,724.00", sold: 100, width: "64%" },
    { name: "Wiener Art", amount: "€1,626.30", sold: 97, width: "60%" },
    { name: "Bitburger", amount: "€1,197.00", sold: 337, width: "45%" },
    { name: "Beilagen Salat", amount: "€1,083.50", sold: 197, width: "40%" },
    { name: "Kohlroulade mit Kartoffelpüree u. Specksauce", amount: "€1,081.20", sold: 68, width: "38%" },
    { name: "Sauerbraten mit Rotkohl u. Klöße", amount: "€1,065.90", sold: 51, width: "35%" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Row 1 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <Card className="shadow-sm border-gray-200 rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">€45,347.00</div>
            <p className="text-xs text-red-500 font-medium mt-2">-2.0% vs prev period</p>
          </CardContent>
        </Card>
        
        {/* AOV */}
        <Card className="shadow-sm border-gray-200 rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-500">
              AOV
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">€76.99</div>
            <p className="text-xs text-green-500 font-medium mt-2">+5.4% vs prev period</p>
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="shadow-sm border-gray-200 rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tip
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">€0.00</div>
            <p className="text-xs text-gray-400 font-medium mt-2">No previous data</p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="shadow-sm border-gray-200 rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <CardTitle className="text-sm font-medium text-gray-500">
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-bold text-gray-900">589</div>
            <p className="text-xs text-red-500 font-medium mt-2">-7.0% vs prev period</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivery */}
        <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
          <Truck className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-500">Delivery</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
        </Card>

        {/* Pickup */}
        <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
          <ShoppingBag className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-500">Pickup</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">22</span>
        </Card>

        {/* Dine in */}
        <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
          <UtensilsCrossed className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-500">Dine in</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">567</span>
        </Card>

        {/* Reservation */}
        <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
          <CalendarCheck className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-500">Reservation</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">459</span>
        </Card>
      </div>

      {/* Charts & Top Sellers Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Overview Chart Area */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200 rounded-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 border-b border-transparent">
            <CardTitle className="text-lg font-bold text-gray-900">
              Order Overview
            </CardTitle>
            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setChartView("amount")}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartView === "amount"
                    ? "bg-black text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Amount
              </button>
              <button
                onClick={() => setChartView("count")}
                className={`px-5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartView === "count"
                    ? "bg-black text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Count
              </button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            {/* Simple Mock Line Chart using SVG */}
            <div className="w-full h-72 relative">
              <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <g key={i}>
                    <line x1="40" y1={250 - i * 40} x2="800" y2={250 - i * 40} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="35" y={254 - i * 40} fontSize="12" fill="#9ca3af" textAnchor="end">
                      €{i * 500}
                    </text>
                  </g>
                ))}
                
                {/* X Axis Labels */}
                {["02/01", "02/09", "02/17", "02/25", "03/05", "03/13", "03/21", "03/29", "04/06", "04/14", "04/22", "04/30"].map((label, i) => (
                  <text key={label} x={40 + i * (760 / 11)} y="275" fontSize="12" fill="#9ca3af" textAnchor="middle">
                    {label}
                  </text>
                ))}

                {/* Data Line and Area */}
                <path 
                  d="M 40 100 Q 60 250 80 180 T 110 170 T 130 190 T 150 250 T 160 80 T 180 200 T 200 170 T 220 250 T 230 90 T 250 210 T 260 180 T 280 90 T 300 210 T 310 180 T 320 250" 
                  fill="none" stroke="#374151" strokeWidth="2" 
                />
                <path 
                  d="M 40 250 L 40 100 Q 60 250 80 180 T 110 170 T 130 190 T 150 250 T 160 80 T 180 200 T 200 170 T 220 250 T 230 90 T 250 210 T 260 180 T 280 90 T 300 210 T 310 180 T 320 250 L 320 250 L 40 250 Z" 
                  fill="rgba(243, 244, 246, 0.5)" 
                />
                
                {/* Data Points */}
                {[
                  [40, 100], [80, 180], [110, 170], [130, 190], [150, 250], [160, 80], 
                  [180, 200], [200, 170], [220, 250], [230, 90], [250, 210], [260, 180], 
                  [280, 90], [300, 210], [310, 180], [320, 250]
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#374151" stroke="white" strokeWidth="1.5" />
                ))}

                {/* Zero line for rest of the chart */}
                <path d="M 320 250 L 800 250" fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card className="col-span-1 shadow-sm border-gray-200 rounded-2xl flex flex-col h-full">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">
              Top Sellers
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {topSellers.map((item, index) => (
                <div key={index} className="flex flex-col gap-1.5 relative">
                  <div className="flex justify-between items-end text-sm z-10 relative">
                    <div className="flex gap-2 items-center w-[65%]">
                      <span className="text-gray-400 font-medium text-xs">{index + 1}</span>
                      <span className="font-medium text-gray-800 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="font-bold text-gray-900">{item.amount}</span>
                      <span className="text-xs text-gray-400 w-12">{item.sold} sold</span>
                    </div>
                  </div>
                  {/* Progress Bar Background */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    {/* Progress Bar Fill */}
                    <div 
                      className="h-full bg-[#1e293b] rounded-full" 
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
