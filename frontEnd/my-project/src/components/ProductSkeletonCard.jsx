import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeletonCard = () => {
  return (
    <Card className="rounded-2xl shadow-md overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-56" />

      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-6 w-1/3" />
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
};

export default ProductSkeletonCard;
