import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  CalendarCheck,
  Globe,
  Bell,
  User,
  Moon,
  ChevronDown,
} from "lucide-react";
import LastThreeMonth from "./LastThreeMonth";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("today");
  const [chartView, setChartView] = useState("amount");

  return (
    <div className="flex flex-col gap-6 w-full mx-auto pb-10">
      {/* Header Area from Design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <span className="bg-amber-200 text-amber-900 text-xs font-medium px-3 py-1 rounded">
              Development mode
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Operational dashboard with key shop performance metrics and
            activity.
          </p>

          <div className="mt-4 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-400 px-4 py-3 flex gap-3">
            <svg className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                You're in development mode
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                Data shown may be test data. Features and metrics may not
                reflect production values. This mode is intended for testing and
                development purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="today"
        className="w-full overflow-x-auto"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-transparent border border-gray-200 p-1.5 h-auto flex gap-1 rounded-lg justify-start inline-flex">
          <TabsTrigger
            value="today"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="this-week"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium"
          >
            This Week
          </TabsTrigger>
          <TabsTrigger
            value="this-month"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium"
          >
            This Month
          </TabsTrigger>
          <TabsTrigger
            value="last-month"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium"
          >
            Last Month
          </TabsTrigger>
          <TabsTrigger
            value="last-3-months"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium border border-transparent data-[state=active]:border-blue-600"
          >
            Last Three Month
          </TabsTrigger>
          <TabsTrigger
            value="last-6-months"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 rounded-md px-4 py-2 text-gray-500 font-medium"
          >
            Last Six Month
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Render selected view */}
      {activeTab === "last-3-months" ? (
        <LastThreeMonth />
      ) : (
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
                <div className="text-3xl font-bold text-gray-900">€0.00</div>
                <p className="text-xs text-gray-400 mt-2">No previous data</p>
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
                <div className="text-3xl font-bold text-gray-900">€0.00</div>
                <p className="text-xs text-gray-400 mt-2">No previous data</p>
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
                <p className="text-xs text-gray-400 mt-2">No previous data</p>
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
                <div className="text-3xl font-bold text-gray-900">0</div>
                <p className="text-xs text-gray-400 mt-2">No previous data</p>
              </CardContent>
            </Card>
          </div>

          {/* Row 2 Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Delivery */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <Truck className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium text-gray-500">
                Delivery
              </span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Pickup */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <ShoppingBag
                className="w-6 h-6 text-gray-700 mb-3"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium text-gray-500">Pickup</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Dine in */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <UtensilsCrossed
                className="w-6 h-6 text-gray-700 mb-3"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium text-gray-500">Dine in</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Reservation */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <CalendarCheck
                className="w-6 h-6 text-gray-700 mb-3"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium text-gray-500">
                Reservation
              </span>
              <span className="text-2xl font-bold text-gray-900 mt-1">4</span>
            </Card>
          </div>

          {/* Order Overview Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 shadow-sm border-gray-200 rounded-2xl flex flex-col min-h-[400px]">
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
              <CardContent className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 text-sm font-medium">
                  No data found
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
