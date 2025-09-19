import { LoaderCircle } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="w-full h-32 flex items-center justify-center">
      <span className="flex items-center gap-2">
        <LoaderCircle className="animate-spin text-primary" />
        <p className="text-foreground">Loading...</p>
      </span>
    </div>
  );
};

export default Loader;
