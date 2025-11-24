import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  function handleFile(e) {
    setFile(e.target.files[0]);
    // console.log("file Added -> ", e.target.files[0]);
  }
  async function submit() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", jobDescription);
    try {
      const res = await axios.post("http://e1r9p14.1337.ma:8000/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // responseType: "blob",
      });
      console.log("content -> ", res.data);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br flex flex-col items-center justify-center">
      <div className="w-1/4 flex flex-col gap-5">
        <div>
          {file ? (
            <div className="p-4 bg-none rounded-lg border border-dashed border-white/25">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-300 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="block text-sm/6 font-semibold text-white">Resume</label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                <div className="text-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" data-slot="icon" aria-hidden="true" className="mx-auto size-12 text-gray-600">
                    <path
                      d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                    />
                  </svg>
                  <div className="mt-4 flex text-sm/6 text-gray-400">
                    <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 hover:text-indigo-300">
                      <span>Upload a file</span>
                      <input onChange={handleFile} id="file-upload" type="file" name="file-upload" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs/5 text-gray-400">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div>
          <label className="text-sm/6 font-semibold text-white mb-2">Description</label>
          <textarea
            onChange={(e) => setJobDescription(e.target.value)}
            value={jobDescription}
            className="mt-1 rounded-md w-full p-2"
            rows={5}
          ></textarea>
        </div>
        <div>
          <button onClick={() => submit()} className="text-white font-bold bg-indigo-500 w-full py-2 rounded-full">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
