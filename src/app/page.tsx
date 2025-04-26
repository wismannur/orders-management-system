"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/context/order-context";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { DateRange } from "@/types";
import { exportToExcel, generateSampleData } from "@/utils/excel-export";
import { format } from "date-fns";
import {
  Download,
  Edit,
  FileSpreadsheet,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrderList() {
  // Redirect to login if not authenticated
  useAuthRedirect({ whenUnauthenticated: "/login" });

  const { orders, loading, error, searchOrders, deleteOrder } = useOrders();
  const [orderNo, setOrderNo] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const handleSearch = async () => {
    await searchOrders(orderNo, dateRange);
  };

  const handleReset = async () => {
    setOrderNo("");
    setDateRange({ startDate: null, endDate: null });
    await searchOrders("", { startDate: null, endDate: null });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToExcel(orders, "orders.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSample = async () => {
    setIsExporting(true);
    try {
      const sampleData = generateSampleData(5000);
      await exportToExcel(sampleData, "sample_orders.xlsx");
    } catch (error) {
      console.error("Error exporting sample data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingOrderId(id);
      await deleteOrder(id);
    } catch (error) {
      console.error("Error deleting order:", error);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleReload = async () => {
    await searchOrders(orderNo, dateRange);
  };

  return (
    <div className="container mx-auto py-4 px-4 sm:py-8">
      <div className="flex justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <Link href="/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle>Search Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Order Number</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <DatePicker
                date={dateRange.startDate || undefined}
                onSelect={(date) =>
                  setDateRange({ ...dateRange, startDate: date || null })
                }
                label="Start Date"
              />
            </div>
            <div>
              <DatePicker
                date={dateRange.endDate || undefined}
                onSelect={(date) =>
                  setDateRange({ ...dateRange, endDate: date || null })
                }
                label="End Date"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Order List</CardTitle>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleReload}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Reload
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || orders.length === 0}
              className="flex-1 sm:flex-none"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleExportSample}
              disabled={isExporting}
              className="flex-1 sm:flex-none"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Sample
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found. Create a new order to get started.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Grand Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_no}
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          {format(order.order_date, "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp{order.grand_total.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/orders/edit/${order.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Order
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete order{" "}
                                    {order.order_no}? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(order.id!)}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={deletingOrderId === order.id}
                                  >
                                    {deletingOrderId === order.id ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
