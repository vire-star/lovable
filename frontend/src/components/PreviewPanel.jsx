import { useState } from "react";

const PreviewPanel = () => {
  const [previewUrl, setPreviewUrl] = useState(null);

  return (
    <div className="w-full h-full border-l">
      {previewUrl ? (
        <iframe
          src={previewUrl}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No preview yet
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
