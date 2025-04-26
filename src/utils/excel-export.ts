import type { Order } from "@/types";
import { format } from "date-fns";
import ExcelJS from "exceljs";

export const exportToExcel = async (
  orders: Order[],
  fileName = "orders.xlsx"
): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  // Add headers
  worksheet.columns = [
    { header: "Order No", key: "order_no", width: 20 },
    { header: "Customer Name", key: "customer_name", width: 30 },
    { header: "Order Date", key: "order_date", width: 15 },
    { header: "Grand Total", key: "grand_total", width: 15 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data
  orders.forEach((order) => {
    worksheet.addRow({
      order_no: order.order_no,
      customer_name: order.customer_name,
      order_date: format(order.order_date, "dd MMM yyyy"),
      grand_total: order.grand_total,
    });
  });

  // Format the grand total column as IDR currency
  worksheet.getColumn("grand_total").numFmt = "Rp#,##0";

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  // Create a blob from the buffer
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create a download link and trigger the download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Function to generate sample data for testing large exports
export const generateSampleData = (count = 5000): Order[] => {
  const sampleOrders: Order[] = [];

  for (let i = 1; i <= count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365)); // Random date within the last year

    const products = [];
    const productCount = Math.floor(Math.random() * 5) + 1; // 1-5 products per order

    let grandTotal = 0;

    for (let j = 1; j <= productCount; j++) {
      const qty = Math.floor(Math.random() * 10) + 1;
      const price = Number.parseFloat((Math.random() * 100 + 10).toFixed(2));
      const subtotal = qty * price;

      grandTotal += subtotal;

      products.push({
        order_id: `sample-${i}`,
        product_name: `Product ${j}`,
        qty,
        price,
        subtotal,
      });
    }

    const orderNo = `INV${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}-${i
      .toString()
      .padStart(3, "0")}`;

    sampleOrders.push({
      id: `sample-${i}`,
      order_no: orderNo,
      customer_name: `Customer ${i}`,
      order_date: date,
      grand_total: Number.parseFloat(grandTotal.toFixed(2)),
      products,
    });
  }

  return sampleOrders;
};
