import React, { useState, useEffect } from 'react';
import { useUserId } from '../../context/auth.context';
import { getPastSubmittedQuestions } from '../../api'; // Update this with the correct API import

const SubmittedQuestions = ({ setIsSubmittedQuestionsOpen }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const employeeId = useUserId();
  const pageSize = 3;

  useEffect(() => {
    const fetchSubmittedQuestions = async () => {
      try {
        const response = await getPastSubmittedQuestions(employeeId, pageNumber, pageSize);
        if (response && response.data) {
          setSubmittedQuestions(response.data);
          setTotalPages(Math.max(1, Math.ceil(response.total / pageSize)));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        setError('Error fetching submitted questions');
        console.error('Error fetching submitted questions:', error);
      }
    };

    if (employeeId) {
      fetchSubmittedQuestions();
    }
  }, [employeeId, pageNumber]);

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div>
      <div className="col-span-5">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex w-full justify-between">
            <h2 className="text-lg font-semibold mb-4">All Submitted Questions</h2>
            <button
              onClick={() => setIsSubmittedQuestionsOpen(false)}
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
                  className="border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-start"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-400 ml-2 mb-1">Question {idx + 1}</span>
                    <span className="text-base text-slate-900 ml-2 mb-2">{question.question}</span>
                    {['A', 'B', 'C', 'D'].map((option, idx) => (
                      <span
                        key={idx}
                        className={`${question.answer === idx ? 'text-green-600' : 'text-red-400'} text-sm ml-2`}
                      >
                        {`${option}: ${question[option]}`}
                      </span>
                    ))}
                    <span className="text-sm text-slate-400 ml-2"></span>
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

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SubmittedQuestions;
