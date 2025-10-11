import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { setSearchQuery } from "@/redux/slice/jobSlice";
import React from "react";
import { useDispatch } from "react-redux";
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchQueryHandler = (query: string) => {
    dispatch(setSearchQuery(query));
    navigate("/browse");
  };

  return (
    <div className="my-10 mx-auto w-full max-w-xl relative">
      <Carousel>
        <CarouselContent>
          {categories.map((category, idx) => (
            <CarouselItem
              key={idx}
              className="md:basis-1/2 lg:basis-1/3 flex justify-center"
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
        <CarouselPrevious className="left-[-2rem]" />
        <CarouselNext className="right-[-2rem]" />
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
