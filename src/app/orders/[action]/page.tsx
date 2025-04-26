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
import type { Order } from "@/types";
import clsx from "clsx";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";

export default function OrderForm() {
  const router = useRouter();
  const params = useParams();
  console.log("params ", params);

  const { getOrder, addOrder, updateOrder } = useOrders();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = params.action === "edit" || params.id !== undefined;
  const orderId = isEdit ? (params.id as string) : "";

  // Setup react-hook-form
  const { control, handleSubmit, setValue, watch, reset } = useForm<Order>({
    defaultValues: {
      order_no: "",
      customer_name: "",
      order_date: new Date(),
      grand_total: 0,
      products: [
        {
          order_id: "",
          product_name: "",
          qty: 1,
          price: 0,
          subtotal: 0,
        },
      ],
    },
  });

  // Setup field array for products
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  // Watch products to calculate grand total
  const products = watch("products");

  // Calculate subtotal and grand total
  useEffect(() => {
    if (products) {
      let total = 0;
      products.forEach((product, index) => {
        const subtotal = calculateSubtotal(product.qty, product.price);
        setValue(`products.${index}.subtotal`, subtotal);
        total += subtotal;
      });
      setValue("grand_total", total);
    }
  }, [products, setValue]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (isEdit && orderId) {
        setLoading(true);
        try {
          const orderData = await getOrder(orderId);
          console.log("Retrieved order data:", orderData); // Debug log

          if (orderData) {
            // Ensure all required fields are present and properly formatted
            const formattedData = {
              id: orderData.id,
              order_no: orderData.order_no || "",
              customer_name: orderData.customer_name || "",
              order_date:
                orderData.order_date instanceof Date
                  ? orderData.order_date
                  : new Date(orderData.order_date),
              grand_total:
                typeof orderData.grand_total === "number"
                  ? orderData.grand_total
                  : 0,
              products: Array.isArray(orderData.products)
                ? orderData.products.map((product) => ({
                    id: product.id,
                    order_id: orderId,
                    product_name: product.product_name || "",
                    qty: typeof product.qty === "number" ? product.qty : 1,
                    price:
                      typeof product.price === "number" ? product.price : 0,
                    subtotal:
                      typeof product.subtotal === "number"
                        ? product.subtotal
                        : 0,
                  }))
                : [
                    {
                      order_id: orderId,
                      product_name: "",
                      qty: 1,
                      price: 0,
                      subtotal: 0,
                    },
                  ],
            };

            console.log("Formatted data for form:", formattedData); // Debug log
            reset(formattedData);
          } else {
            console.error("No order data returned");
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [isEdit, orderId, getOrder, router, reset]);

  const calculateSubtotal = (qty: number, price: number): number => {
    return Number.parseFloat((qty * price).toFixed(2));
  };

  const addProduct = () => {
    append({
      order_id: orderId || "",
      product_name: "",
      qty: 1,
      price: 0,
      subtotal: 0,
    });
  };

  const onSubmit = async (data: Order) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateOrder(orderId, data);
      } else {
        await addOrder(data);
      }
      router.push("/");
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setSaving(false);
    }
  };

  // Replace the current loading state with a skeleton UI
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-md bg-gray-200 animate-pulse mr-4" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Order Details Card Skeleton */}
        <div className="mb-8 border rounded-lg bg-white">
          <div className="p-6 border-b">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Card Skeleton */}
        <div className="mb-8 border rounded-lg bg-white">
          <div className="p-6 border-b flex justify-between">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6">
            <div className="border rounded-md">
              <div className="border-b p-4">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-6 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
              {[1, 2].map((row) => (
                <div key={row} className="p-4 border-b">
                  <div className="grid grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-[300px]">
                <div className="flex justify-between py-2">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Order" : "New Order"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={clsx(
                "grid grid-cols-1 gap-6",
                isEdit ? "md:grid-cols-3" : "md:grid-cols-2"
              )}
            >
              {isEdit && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Order Number</label>
                  <Controller
                    name="order_no"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} disabled className="bg-gray-50" />
                    )}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Controller
                  name="customer_name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter customer name" />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="order_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      date={field.value}
                      onSelect={(date) => field.onChange(date || new Date())}
                      label="Order Date"
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Products</CardTitle>
            <Button type="button" onClick={addProduct} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="w-[150px]">Quantity</TableHead>
                    <TableHead className="w-[150px]">Price</TableHead>
                    <TableHead className="w-[150px] text-right">
                      Subtotal
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Controller
                          name={`products.${index}.product_name`}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Enter product name"
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`products.${index}.qty`}
                          control={control}
                          rules={{ required: true, min: 1 }}
                          render={({ field }) => (
                            <NumericFormat
                              customInput={Input}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix=""
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.floatValue || 0);
                              }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`products.${index}.price`}
                          control={control}
                          rules={{ required: true, min: 0 }}
                          render={({ field }) => (
                            <NumericFormat
                              customInput={Input}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="Rp"
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.floatValue || 0);
                              }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp
                        {watch(`products.${index}.subtotal`).toLocaleString(
                          "id-ID"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => fields.length > 1 && remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-[300px]">
                <div className="flex justify-between py-2 font-medium">
                  <span>Grand Total:</span>
                  <span>Rp{watch("grand_total").toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to discard your changes? Any unsaved
                  changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push("/")}>
                  Discard Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
