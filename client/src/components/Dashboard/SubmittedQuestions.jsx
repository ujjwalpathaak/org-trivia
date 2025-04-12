import React, { useState, useEffect } from 'react';
import { editEmployeeQuestionAPI, fetchSubmittedQuestionsAPI } from '../../api';

const SubmittedQuestions = ({ setIsSubmittedQuestionOpen }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [cachedPages, setCachedPages] = useState({});
  const [error, setError] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const pageSize = 3;

  useEffect(() => {
    if (cachedPages[pageNumber]) {
      setSubmittedQuestions(cachedPages[pageNumber]);
      return;
    }

    const fetchSubmittedQuestions = async () => {
      try {
        const response = await fetchSubmittedQuestionsAPI(pageNumber, pageSize);
        if (response && response.data) {
          setSubmittedQuestions(response.data);
          setTotalPages(Math.max(1, Math.ceil(response.total / pageSize)));
          setCachedPages((prevCache) => ({
            ...prevCache,
            [pageNumber]: response.data,
          }));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        setError('Error fetching submitted questions');
        console.error('Error fetching submitted questions:', error);
      }
    };

    fetchSubmittedQuestions();
  }, [pageNumber]);

  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, totalPages - 1));

  const onQuestionChange = (index, value) => {
    const updated = [...submittedQuestions];
    updated[index].question = value;
    setSubmittedQuestions(updated);
  };

  const onOptionChange = (questionIndex, optionIndex, value) => {
    const updated = [...submittedQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setSubmittedQuestions(updated);
  };

  const onCorrectAnswerChange = (index, value) => {
    const updated = [...submittedQuestions];
    updated[index].answer = parseInt(value);
    setSubmittedQuestions(updated);
  };

  const saveEditedQuestion = async () => {
    await editEmployeeQuestionAPI(submittedQuestions);
  };

  const QuestionEditor = ({
    question,
    index,
    onQuestionChange,
    onOptionChange,
    onCorrectAnswerChange,
  }) => {
    if (!question) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setEditingQuestionIndex(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Questions
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
            <textarea
              value={question.question}
              onChange={(e) => onQuestionChange(index, e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-lg min-h-[100px]"
            />
          </div>

          {question.image && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
              <img src={question.image} alt="Question" className="w-[20%] rounded-lg shadow-sm" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-3">
              {question.options?.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => onOptionChange(index, i, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg transition duration-200 ${
                      i === question.answer
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <select
              value={question.answer || ''}
              onChange={(e) => onCorrectAnswerChange(index, e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
            >
              {question.options?.map((option, i) => (
                <option key={i} value={i}>
                  Option {String.fromCharCode(65 + i)} - {option}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={saveEditedQuestion}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="col-span-5">
      <div className="bg-white rounded-lg p-6 shadow-md">
        {editingQuestionIndex !== null ? (
          <QuestionEditor
            question={submittedQuestions[editingQuestionIndex]}
            index={editingQuestionIndex}
            onQuestionChange={onQuestionChange}
            onOptionChange={onOptionChange}
            onCorrectAnswerChange={onCorrectAnswerChange}
          />
        ) : (
          <>
            <div className="flex w-full justify-between">
              <h2 className="text-lg font-semibold mb-4">All Submitted Questions</h2>
              <button
                onClick={() => setIsSubmittedQuestionOpen(false)}
                className="hover:text-red-900 bg-gray-200 hover:bg-red-300 rounded-full px-2 py-2 w-8 h-8 flex items-center justify-center"
              >
                X
              </button>
            </div>

            {submittedQuestions.length > 0 ? (
              <div className="space-y-4">
                {submittedQuestions?.map((question, idx) => (
                  <div
                    key={idx}
                    className={`border
                     ${
                       question.state === 'approved' &&
                       'bg-green-50 border-green-200 text-green-600'
                     }
                       ${question.state === 'rejected' && 'bg-red-50 border-red-200 text-red-600'}
                           ${question.state === 'rejected' && 'line-through'} rounded-lg p-4 shadow-sm flex items-center justify-start`}
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400 ml-2 mb-1">Question {idx + 1}</span>
                        {question.state === 'approved' && (
                          <span className="text-sm text-green-600 ml-2 mb-1">Approved</span>
                        )}
                        {question.state === 'rejected' && (
                          <span className="text-sm text-red-600 ml-2 mb-1">Rejected</span>
                        )}
                        {question.state === 'submitted' && (
                          <button
                            className="text-sm hover:underline text-blue-500"
                            onClick={() => setEditingQuestionIndex(idx)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <span className="text-base text-slate-900 ml-2 mb-2 break-all">
                        {question.question}
                      </span>

                      {['A', 'B', 'C', 'D'].map((option, optionIdx) => (
                        <span
                          key={optionIdx}
                          className={`${
                            question.answer === optionIdx ? 'text-green-600' : 'text-red-400'
                          } text-sm ml-2`}
                        >
                          {`${option}: ${question.options?.[optionIdx] || ''}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={pageNumber === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pageNumber === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Previous
                  </button>

                  <span className="text-gray-700 font-semibold">
                    Page <span className="text-blue-600">{pageNumber + 1}</span> of {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={pageNumber === totalPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pageNumber === totalPages - 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No questions available.</p>
            )}
          </>
        )}

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default SubmittedQuestions;
