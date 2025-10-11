import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const JobsListCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-16 bg-gray-300 rounded" />
          <div className="h-5 w-5 bg-gray-300 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-300" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-300 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2 mt-2.5">
          <div className="h-5 w-40 bg-gray-300 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-start">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="flex mt-2 gap-3">
          <div className="h-8 w-24 bg-gray-300 rounded-md" />
          <div className="h-8 w-28 bg-gray-200 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobsListCardSkeleton;
