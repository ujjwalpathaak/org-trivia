import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const QuestionMaker = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", answer);
    formData.append("image", image);

    options.forEach((option, index) => {
      formData.append(`option${index + 1}`, option);
    });

    console.log("Form Data to Submit:", formData);
  };

  return (
    <div className="parent-page-div flex justify-center items-center">
      <div className="max-w-2xl mx-auto p-6 bg-white floating-div rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Create Question</h1>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-2 max-h-30 overflow-y-auto block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question here"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            className="mt-2 block w-full text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          {options.map((option, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Correct Answer
          </label>
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Correct Answer</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                Option {index + 1}:{" "}
                {option.length > 15 ? option.substring(0, 15) + "..." : option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionMaker;
