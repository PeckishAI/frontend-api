import { RestaurantList } from "@/components/RestaurantList";

export function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
      <RestaurantList />
    </div>
  );
}
