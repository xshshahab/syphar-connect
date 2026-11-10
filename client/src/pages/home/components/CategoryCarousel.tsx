import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import { useNavigate } from "react-router";

const categories = [
  "Frontend Developer",
  "Backend Developer",
  "Data Science",
  "Graphic Designer",
  "FullStack Developer",
  "Devops Engineer",
];

const CategoryCarousel: React.FC = () => {
  const navigate = useNavigate();

  const searchQueryHandler = (query: string) => {
    navigate(`/search?role=${encodeURIComponent(query)}`);
  };

  return (
    <div className="my-10 mx-auto w-full max-w-xl relative px-4 sm:px-0">
      <Carousel>
        <CarouselContent>
          {categories.map((category, idx) => (
            <CarouselItem
              key={idx}
              className="basis-1/2 lg:basis-1/3 flex justify-center"
            >
              <Button
                onClick={() => searchQueryHandler(category)}
                className="rounded-full cursor-pointer"
                variant="outline"
              >
                {category}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Prev/Next Buttons */}
        <CarouselPrevious className="left-[-2rem] hidden sm:inline-flex" />
        <CarouselNext className="right-[-2rem] hidden sm:inline-flex" />
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
