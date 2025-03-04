import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewQuestion } from '../api';
import { useOrgId } from '../context/auth.context';

import { toast } from 'react-toastify';

const QuestionMaker = () => {
  const navigate = useNavigate();
  const orgId = useOrgId();

  const [question, setQuestion] = useState({
    question: '',
    answer: '',
    options: ['', '', '', ''],
    image: null,
    source: 'Employee',
    org: orgId,
    config: {},
    category: '',
    config: { isUsed: false, puzzleType: '', refactor: false },
  });

  const notifyQuestionSubmitted = () => toast('New question submitted!');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setQuestion((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;
      return { ...prev, options: updatedOptions };
    });
  };

  const handleChangePuzzleType = (event) => {
    const newPuzzleType = event.target.value;
    setQuestion((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        puzzleType: newPuzzleType,
        refactor:
          newPuzzleType === 'BloodRelation' || newPuzzleType === 'Direction',
      },
    }));
  };

  const handleImageChange = (event) => {
    setQuestion((prev) => ({
      ...prev,
      image: event.target.files[0],
    }));
  };

  const handleSubmit = () => {
    notifyQuestionSubmitted();
    createNewQuestion(question);
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
            name="question"
            value={question.question}
            onChange={handleChange}
            className="mt-2 max-h-30 overflow-y-auto block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question here"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={question.category}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {/* <option value="CCnHnFF">Company Culture, History & Facts</option> */}
            <option value="CAnIT">
              Company Achievements and Industry Trends
            </option>
            <option value="HRD">HR Docs</option>
            <option value="PnA">Puzzles and Aptitude</option>
          </select>
        </div>
        {
          // conditionally render options based on selected category
          question.category === 'PnA' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Puzzle Type
              </label>
              <select
                name="category"
                value={question?.config?.puzzleType || ''}
                onChange={handleChangePuzzleType}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select PuzzleType</option>
                <option value="BloodRelation">Blood Relations</option>
                <option value="Analytical">Analytical</option>
                <option value="Arithmetic">Arithmetic</option>
                <option value="Direction">Direction</option>
              </select>
            </div>
          )
        }
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
          {question.options.map((option, index) => (
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
            name="answer"
            value={question.answer}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Correct Answer</option>
            {question.options.map((option, index) => (
              <option key={index} value={index}>
                Option {index + 1}:{' '}
                {option.length > 15 ? option.substring(0, 15) + '...' : option}
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
