"use client";

import {
  addOrderApi,
  deleteOrderApi,
  fetchOrder,
  fetchOrders,
  searchOrdersApi,
  updateOrderApi,
} from "@/services/order-service";
import type { DateRange, Order, OrderContextType } from "@/types";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";

// Create a client
const queryClient = new QueryClient();

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: orders = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  // Error handling
  const error = queryError ? (queryError as Error).message : null;

  // Mutations
  const addOrderMutation = useMutation({
    mutationFn: addOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: Order }) =>
      updateOrderApi(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const searchOrdersMutation = useMutation({
    mutationFn: ({
      orderNo,
      dateRange,
    }: {
      orderNo: string;
      dateRange: DateRange;
    }) => searchOrdersApi(orderNo, dateRange),
  });

  // Context methods
  const getOrder = async (id: string): Promise<Order | null> => {
    const result = await queryClient.fetchQuery({
      queryKey: ["order", id],
      queryFn: () => fetchOrder(id),
    });
    return result;
  };

  const addOrder = async (order: Order): Promise<string> => {
    return await addOrderMutation.mutateAsync(order);
  };

  const updateOrder = async (id: string, order: Order): Promise<void> => {
    await updateOrderMutation.mutateAsync({ id, order });
  };

  const deleteOrder = async (id: string): Promise<void> => {
    await deleteOrderMutation.mutateAsync(id);
  };

  const searchOrders = async (
    orderNo: string,
    dateRange: DateRange
  ): Promise<void> => {
    await searchOrdersMutation.mutateAsync({ orderNo, dateRange });
  };

  const fetchOrdersManually = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <OrderContext.Provider
      value={{
        orders: searchOrdersMutation.data || orders,
        loading:
          loading ||
          addOrderMutation.isPending ||
          updateOrderMutation.isPending ||
          deleteOrderMutation.isPending ||
          searchOrdersMutation.isPending,
        error,
        fetchOrders: fetchOrdersManually,
        getOrder,
        addOrder,
        updateOrder,
        deleteOrder,
        searchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

// Wrap the OrderProvider with QueryClientProvider
export const OrderProviderWithClient = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <OrderProvider>{children}</OrderProvider>;
};
