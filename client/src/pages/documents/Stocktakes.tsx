import StocktakesView from "@/components/documents/StocktakesView";

interface StocktakesProps {
  viewMode: "cards" | "table";
}

export default function Stocktakes({ viewMode }: StocktakesProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <StocktakesView viewMode={viewMode} />
    </div>
  );
}