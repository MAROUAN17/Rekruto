import { useState, useRef } from "react";
import ContentEditable from "react-contenteditable";
import axios from "axios";

function ResumeEditor({ initialHtml }) {
  const [html, setHtml] = useState(initialHtml);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef(null);

  console.log("ResumeEditor mounted with HTML length:", html.length);

  if (!initialHtml) {
    return (
      <div className="p-4 border rounded bg-red-50">
        <p className="text-red-600">Error: No HTML content provided</p>
      </div>
    );
  }
  const handleChange = (evt) => {
    setHtml(evt.target.value);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/generate-pdf",
        { html },
        { responseType: "blob" }
      );

      // Download PDF
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid bg-none grid-cols-2 gap-4 h-full p-4">
      {/* Editable HTML Panel */}
      <div className="border rounded-lg overflow-auto">
        <div className="bg-gray-100 p-2 border-b">
          <h3 className="font-bold">Edit Your Resume</h3>
          <p className="text-sm text-gray-600">Click anywhere to edit</p>
        </div>
        <ContentEditable
          innerRef={contentRef}
          html={html}
          onChange={handleChange}
          className="p-6 min-h-full focus:outline-none"
          style={{ fontFamily: "Arial, sans-serif" }}
        />
      </div>

      {/* Live Preview Panel */}
      <div className="border rounded-lg overflow-auto bg-white">
        <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
          <h3 className="font-bold">Live Preview</h3>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>
        <div className="p-6" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

export default ResumeEditor;
