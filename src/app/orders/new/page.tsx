import { redirect } from "next/navigation";

export default function NewOrderPage() {
  redirect("/orders/create");
}
