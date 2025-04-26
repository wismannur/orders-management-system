export interface OrderProduct {
  id?: string;
  order_id: string;
  product_name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  order_no: string;
  customer_name: string;
  order_date: Date;
  grand_total: number;
  products?: OrderProduct[];
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  getOrder: (id: string) => Promise<Order | null>;
  addOrder: (order: Order) => Promise<string>;
  updateOrder: (id: string, order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  searchOrders: (orderNo: string, dateRange: DateRange) => Promise<void>;
}
