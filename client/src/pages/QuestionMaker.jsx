import React, { useState } from 'react';
import { createNewQuestion } from '../api';
import { useOrgId, useUserId } from '../context/auth.context';
import { toast } from 'react-toastify';
import { validateQuestionMakerForm } from '../utils';

const QuestionMaker = ({ setIsQuestionMakerOpen }) => {
  const orgId = useOrgId();
  const employeeId = useUserId();

  const [question, setQuestion] = useState({
    question: '',
    answer: '',
    options: ['', '', '', ''],
    image: null,
    source: 'Employee',
    orgId: orgId,
    category: '',
    config: { puzzleType: '', refactor: false },
  });

  const [errors, setErrors] = useState({});

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
        refactor: newPuzzleType === 'BloodRelation' || newPuzzleType === 'Direction',
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
    const { errors, error } = validateQuestionMakerForm(question);
    if (!error) {
      setErrors(errors);
      toast.error('Please fix validation errors.');
      return;
    }

    notifyQuestionSubmitted();
    createNewQuestion(question, employeeId);
    setQuestion({
      question: '',
      answer: '',
      options: ['', '', '', ''],
      image: null,
      source: 'Employee',
      orgId: orgId,
      category: '',
      config: { puzzleType: '', refactor: false },
    });
  };

  return (
    <div className="col-span-5 h-fit bg-white shine floating-div rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create Question</h1>
        <button
          onClick={() => setIsQuestionMakerOpen(false)}
          className="hover:text-red-900 bg-gray-200 hover:bg-red-300 rounded-full px-2 py-2 w-8 h-8 flex items-center justify-center"
        >
          X
        </button>
      </div>
      <div className="">
        <div className="mb-4">
          <label className="block font-semibold text-lg text-gray-700">Question</label>
          <textarea
            name="question"
            value={question.question}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the question here"
          />
          {errors.question && <p className="text-red-500 text-sm">{errors.question}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-semibold text-lg font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={question.category}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="CAnIT">Company Achievements and Industry Trends</option>
            <option value="HRD">HR Docs</option>
            <option value="PnA">Puzzles and Aptitude</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>

        {question.category === 'PnA' && (
          <div className="mb-4">
            <label className="block font-semibold text-lg text-gray-700">Puzzle Type</label>
            <select
              name="puzzleType"
              value={question?.config?.puzzleType || ''}
              onChange={handleChangePuzzleType}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Puzzle Type</option>
              <option value="BloodRelation">Blood Relations</option>
              <option value="Analytical">Analytical</option>
              <option value="Arithmetic">Arithmetic</option>
              <option value="Direction">Direction</option>
            </select>
            {errors.puzzleType && <p className="text-red-500 text-sm">{errors.puzzleType}</p>}
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold text-lg text-gray-700">Options</label>
          {question.options.map((option, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
          {errors.options && <p className="text-red-500 text-sm">{errors.options}</p>}
        </div>

        <div className="mb-4">
          <label className="block font-semibold text-lg text-gray-700">Correct Answer</label>
          <select
            name="answer"
            value={question.answer}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Correct Answer</option>
            {question.options.map((option, index) => (
              <option key={index} value={index}>
                Option {index + 1}: {option.length > 15 ? option.substring(0, 15) + '...' : option}
              </option>
            ))}
          </select>
          {errors.answer && <p className="text-red-500 text-sm">{errors.answer}</p>}
        </div>

        {/* <div className="mb-4">
          <label className="block font-semibold text-lg text-gray-700">
            Upload Image (Optional)
          </label>
          <input type="file" onChange={handleImageChange} />
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}
        </div> */}
        <div className="w-full mt-6 flex justify-end">
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Submit Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionMaker;
