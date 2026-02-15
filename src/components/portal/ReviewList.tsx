import { Star, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  homeowner_name: string | null;
  createdAt: Date;
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="mt-4 space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-slate-200 pb-4 last:border-b-0">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {review.homeowner_name || "Anonymous"}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="mt-2 text-slate-700">{review.comment}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
