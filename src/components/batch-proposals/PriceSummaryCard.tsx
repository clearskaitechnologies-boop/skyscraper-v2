"use client";

export function PriceSummaryCard({
  homeCount,
  pricePerHome,
  totalPrice,
}: {
  homeCount: number;
  pricePerHome: number;
  totalPrice: number;
}) {
  const discount = 20 - pricePerHome;
  const savings = discount * homeCount;

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg">
      <h4 className="mb-4 text-lg font-semibold text-blue-900">Pricing Summary</h4>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-blue-700">Homes</span>
          <strong className="text-blue-900">{homeCount}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-blue-700">Price per home</span>
          <strong className="text-blue-900">${pricePerHome}</strong>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="text-sm">Volume savings</span>
            <strong>-${savings}</strong>
          </div>
        )}
        <div className="flex justify-between border-t-2 border-blue-300 pt-3">
          <span className="font-semibold text-blue-900">Total</span>
          <strong className="text-2xl text-blue-900">${totalPrice.toLocaleString()}</strong>
        </div>
      </div>
      {discount > 0 && (
        <div className="mt-4 rounded-lg bg-green-100 px-3 py-2 text-center text-sm font-medium text-green-800">
          🎉 You save ${discount}/home with volume pricing!
        </div>
      )}
    </div>
  );
}
