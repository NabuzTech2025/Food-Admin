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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Operational dashboard with key shop performance metrics and activity.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-4 border-gray-200 h-10">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                Availability
                <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Online</DropdownMenuItem>
              <DropdownMenuItem>Offline</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 rounded-full px-4 border-gray-200 h-10">
                <Globe className="w-4 h-4 text-gray-600" />
                EN
                <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>EN - English</DropdownMenuItem>
              <DropdownMenuItem>DE - German</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="rounded-full border-gray-200 h-10 w-10">
            <Moon className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-gray-200 h-10 w-10">
            <Globe className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-gray-200 h-10 w-10 relative">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              65
            </span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-gray-200 h-10 w-10">
            <User className="w-4 h-4 text-gray-600" />
          </Button>
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
              <span className="text-sm font-medium text-gray-500">Delivery</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Pickup */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <ShoppingBag className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium text-gray-500">Pickup</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Dine in */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <UtensilsCrossed className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium text-gray-500">Dine in</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">0</span>
            </Card>

            {/* Reservation */}
            <Card className="shadow-sm border-gray-200 rounded-2xl flex flex-col items-center justify-center py-8">
              <CalendarCheck className="w-6 h-6 text-gray-700 mb-3" strokeWidth={1.5} />
              <span className="text-sm font-medium text-gray-500">Reservation</span>
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
                <p className="text-gray-400 text-sm font-medium">No data found</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
