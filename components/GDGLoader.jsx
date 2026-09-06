// React import
import React from "react";
import Image from "next/image";

// Loader Component
const DWASFWLoader = () => {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <Image className="app-loader-mark" src="/assets/gdg-logo-loader.svg" alt="" width={44} height={44} priority />
      <p>Loading...</p>
    </div>
  );
};

export default DWASFWLoader;

