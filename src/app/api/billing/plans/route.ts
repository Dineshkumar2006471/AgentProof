import { jsonOk } from "@/lib/api";

export async function GET() {
  return jsonOk({
    plans: [
      { id: "free", name: "Free", price: 0 },
      { id: "builder", name: "Builder", priceRange: "999-1999" },
      { id: "agency", name: "Agency", priceRange: "4999-9999" }
    ]
  });
}
