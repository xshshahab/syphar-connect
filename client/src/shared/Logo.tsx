import React from "react";
import logoMark from "@/assets/logo-mark.png";

const Logo: React.FC = () => {
  return (
    <div id="left" className="flex gap-2 items-center">
      {/* The mark is white, so invert it on the light theme */}
      <img
        src={logoMark}
        alt="SypharConnect logo"
        className="h-6 w-auto invert dark:invert-0"
      />
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">
          Syphar<span className="text-red-500">Connect.</span>
        </h1>
      </div>
    </div>
  );
};

export default Logo;
