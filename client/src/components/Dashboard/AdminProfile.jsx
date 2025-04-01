import React, { useState } from 'react';
import Leaderboard from '../Leaderboard';
import { Upload, FileText, X } from 'lucide-react';

const AdminProfile = ({ data }) => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="col-span-3 mb-4">
      <div className="bg-white rounded-lg p-6 shadow mb-4">
        <div className="flex flex-col items-center">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-200"
          />
          {data?.name && `${data.name}`}
        </div>
      </div>
      <Leaderboard />
      <div className="p-4 bg-white  border rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">
          Upload Files to make new HR Policies Questions
        </h2>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50">
          <Upload className="w-8 h-8 text-gray-500" />
          <span className="text-gray-600 text-sm mt-2">Click to upload files</span>
          <input type="file" className="hidden" multiple onChange={handleFileChange} />
        </label>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Uploaded Files</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
