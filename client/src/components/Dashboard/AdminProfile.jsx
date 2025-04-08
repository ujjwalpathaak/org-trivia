import React, { useState } from 'react';
import Leaderboard from '../Leaderboard';
import { Upload, FileText, X } from 'lucide-react';
import { fetchPresignedUrl, startHRPQuestionGeneration, uploadFileToS3 } from '../../api';
import { toast } from 'react-toastify';

const AdminProfile = ({ data }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const MAX_SIZE_MB = 5;

  const handleFileChange = async (event) => {
    const file = event.target.files[0]; // only first file

    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert(`${file.name} is not a PDF file.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`${file.name} exceeds ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);

    try {
      const { uploadUrl, fileUrl } = await fetchPresignedUrl(file);
      await uploadFileToS3(uploadUrl, file);
      await startHRPQuestionGeneration(file.name);

      setFiles([file]);
      toast.success(`✅ ${file.name} uploaded successfully.`);
    } catch (error) {
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeFile = () => {
    setFiles([]);
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

      <div className="p-4 bg-white border rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">
          Upload a File to Generate HR Policies Questions
        </h2>
        <label
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${uploading ? 'border-gray-200 bg-gray-100' : 'border-gray-400 hover:bg-gray-50'} rounded-lg cursor-pointer`}
        >
          <Upload className="w-8 h-8 text-gray-500" />
          <span className="text-gray-600 text-sm mt-2">Click to upload a PDF file</span>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Uploaded File</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button onClick={removeFile} className="text-red-500 hover:text-red-700">
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
