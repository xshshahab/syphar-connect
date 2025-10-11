import { Podcast } from "lucide-react";
import React from "react";

const Logo: React.FC = () => {
  return (
    <div id="left" className="flex gap-2 items-center">
      <Podcast color="red" size={20} />
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">
          Syphar<span className="text-red-500">Connect.</span>
        </h1>
      </div>
    </div>
  );
};

export default Logo;
