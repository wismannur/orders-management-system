import {
  db,
  generateOrderNumber,
  orderProductsCollection,
  ordersCollection,
} from "@/lib/firebase";
import type { DateRange, Order, OrderProduct } from "@/types";
import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export const fetchOrders = async (): Promise<Order[]> => {
  const ordersQuery = query(ordersCollection, orderBy("order_date", "desc"));
  const querySnapshot = await getDocs(ordersQuery);

  const ordersData: Order[] = [];

  for (const docSnapshot of querySnapshot.docs) {
    const orderData = docSnapshot.data();

    // Get products for this order
    const productsQuery = query(
      orderProductsCollection,
      where("order_id", "==", docSnapshot.id)
    );
    const productsSnapshot = await getDocs(productsQuery);

    const products: OrderProduct[] = productsSnapshot.docs.map(
      (productDoc) =>
        ({
          id: productDoc.id,
          ...productDoc.data(),
        } as OrderProduct)
    );

    ordersData.push({
      id: docSnapshot.id,
      order_no: orderData.order_no,
      customer_name: orderData.customer_name,
      order_date: orderData.order_date.toDate(),
      grand_total: orderData.grand_total,
      products,
    });
  }

  return ordersData;
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
  const orderRef = doc(db, "orders", id);
  const orderSnapshot = await getDoc(orderRef);

  if (!orderSnapshot.exists()) {
    return null;
  }

  const orderData = orderSnapshot.data();

  // Get products for this order
  const productsQuery = query(
    orderProductsCollection,
    where("order_id", "==", id)
  );
  const productsSnapshot = await getDocs(productsQuery);

  const products: OrderProduct[] = productsSnapshot.docs.map(
    (productDoc) =>
      ({
        id: productDoc.id,
        ...productDoc.data(),
      } as OrderProduct)
  );

  return {
    id: orderSnapshot.id,
    order_no: orderData.order_no,
    customer_name: orderData.customer_name,
    order_date: orderData.order_date.toDate(),
    grand_total: orderData.grand_total,
    products,
  };
};

export const searchOrdersApi = async (
  orderNo: string,
  dateRange: DateRange
): Promise<Order[]> => {
  let ordersQuery = query(ordersCollection);

  // Apply order number filter if provided
  if (orderNo) {
    ordersQuery = query(
      ordersQuery,
      where("order_no", ">=", orderNo),
      where("order_no", "<=", orderNo + "\uf8ff")
    );
  }

  // Apply date range filter if provided
  if (dateRange.startDate && dateRange.endDate) {
    const startTimestamp = Timestamp.fromDate(dateRange.startDate);
    // Set end date to end of day
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);
    const endTimestamp = Timestamp.fromDate(endDate);

    ordersQuery = query(
      ordersQuery,
      where("order_date", ">=", startTimestamp),
      where("order_date", "<=", endTimestamp)
    );
  }

  // Apply sorting
  ordersQuery = query(ordersQuery, orderBy("order_date", "desc"));

  const querySnapshot = await getDocs(ordersQuery);

  const ordersData: Order[] = [];

  for (const docSnapshot of querySnapshot.docs) {
    const orderData = docSnapshot.data();

    // Get products for this order
    const productsQuery = query(
      orderProductsCollection,
      where("order_id", "==", docSnapshot.id)
    );
    const productsSnapshot = await getDocs(productsQuery);

    const products: OrderProduct[] = productsSnapshot.docs.map(
      (productDoc) =>
        ({
          id: productDoc.id,
          ...productDoc.data(),
        } as OrderProduct)
    );

    ordersData.push({
      id: docSnapshot.id,
      order_no: orderData.order_no,
      customer_name: orderData.customer_name,
      order_date: orderData.order_date.toDate(),
      grand_total: orderData.grand_total,
      products,
    });
  }

  return ordersData;
};

export const addOrderApi = async (order: Order): Promise<string> => {
  // Generate order number if not provided
  if (!order.order_no) {
    order.order_no = await generateOrderNumber();
  }

  // Add order to Firestore
  const orderRef = await addDoc(ordersCollection, {
    order_no: order.order_no,
    customer_name: order.customer_name,
    order_date: Timestamp.fromDate(order.order_date),
    grand_total: order.grand_total,
  });

  // Add order products
  if (order.products && order.products.length > 0) {
    const batch = writeBatch(db);

    order.products.forEach((product) => {
      const productRef = doc(orderProductsCollection);
      batch.set(productRef, {
        order_id: orderRef.id,
        product_name: product.product_name,
        qty: product.qty,
        price: product.price,
        subtotal: product.subtotal,
      });
    });

    await batch.commit();
  }

  return orderRef.id;
};

export const updateOrderApi = async (
  id: string,
  order: Order
): Promise<void> => {
  const orderRef = doc(db, "orders", id);

  // Update order
  await updateDoc(orderRef, {
    customer_name: order.customer_name,
    order_date: Timestamp.fromDate(order.order_date),
    grand_total: order.grand_total,
  });

  // Get existing products
  const productsQuery = query(
    orderProductsCollection,
    where("order_id", "==", id)
  );
  const productsSnapshot = await getDocs(productsQuery);

  // Delete existing products
  const batch = writeBatch(db);
  productsSnapshot.docs.forEach((productDoc) => {
    batch.delete(productDoc.ref);
  });

  // Add updated products
  if (order.products && order.products.length > 0) {
    order.products.forEach((product) => {
      const productRef = doc(orderProductsCollection);
      batch.set(productRef, {
        order_id: id,
        product_name: product.product_name,
        qty: product.qty,
        price: product.price,
        subtotal: product.subtotal,
      });
    });
  }

  await batch.commit();
};

export const deleteOrderApi = async (id: string): Promise<void> => {
  // Delete order products first
  const productsQuery = query(
    orderProductsCollection,
    where("order_id", "==", id)
  );
  const productsSnapshot = await getDocs(productsQuery);

  const batch = writeBatch(db);
  productsSnapshot.docs.forEach((productDoc) => {
    batch.delete(productDoc.ref);
  });

  // Delete the order
  const orderRef = doc(db, "orders", id);
  batch.delete(orderRef);

  await batch.commit();
};
