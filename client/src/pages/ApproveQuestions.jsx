import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchScheduledQuizQuestionsAPI,
  editWeeklyQuizAPI,
  fetchEmployeeQuestionsToApproveAPI,
  approveEmployeeQuestionsAPI,
  rejectEmployeeQuestionsAPI,
  deleteQuestionAPI,
} from '../api.js';

function numToAlpha(num) {
  let alpha = '';
  num++;
  while (num > 0) {
    num--;
    alpha = String.fromCharCode(65 + (num % 26)) + alpha;
    num = Math.floor(num / 26);
  }
  return alpha;
}

function ExtraQuestions({ aiQuestions, empQuestions, onReplaceQuestion, selectedQuestionIndex }) {
  return (
    <div
      className={`${selectedQuestionIndex === null ? 'cursor-not-allowed text-gray-400' : 'text-gray-800'} bg-white rounded-xl shadow-lg p-6 w-1/4`}
    >
      <h2 className="text-2xl font-bold mb-6">Extra Questions</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">AI Questions</h3>
          <div className="space-y-2 overflow-auto max-h-[30vh]">
            {aiQuestions.length === 0 && <span className="italic ">No AI questions available</span>}
            {aiQuestions?.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onReplaceQuestion('ai', q, selectedQuestionIndex)}
                className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-200"
                disabled={selectedQuestionIndex === null}
              >
                <div className="text-sm">{q.question}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Employee Questions</h3>
          <div className="space-y-2 overflow-auto max-h-[30vh]">
            {empQuestions.length === 0 && (
              <span className="italic ">No employee questions available</span>
            )}
            {empQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onReplaceQuestion('employee', q, selectedQuestionIndex)}
                className={`${selectedQuestionIndex === null && 'cursor-not-allowed'} w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-200`}
                disabled={selectedQuestionIndex === null}
              >
                <div className="text-sm">{q.question}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionList({
  questions,
  onSelectQuestion,
  selectedQuestionIndex,
  selectedQuestions,
  onToggleQuestionSelect,
  employeeApproveMode,
  selectedCategory,
  onSelectQuestionReplace,
  onSelectQuestionDelete,
  selectQuestionReplace,
  selectQuestionDelete,
  onCategoryChange,
}) {
  const categories = [...new Set(questions.map((q) => q.category))].sort();
  let width = 'w-[98%]';
  if (!employeeApproveMode) {
    if (selectQuestionReplace === null && selectQuestionDelete === null) {
      width = 'w-[98%]';
    } else if (selectQuestionReplace === null || selectQuestionDelete === null) {
      width = 'w-[70%]';
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${width}`}>
      {!employeeApproveMode && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Scheduled Questions</h2>
      )}
      {employeeApproveMode && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Questions</h2>
      )}

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 overflow-auto max-h-[calc(100vh-16rem)]">
        {questions.length === 0 && (
          <span className="italic text-slate-400">No questions found</span>
        )}

        {questions
          .filter((q) => !selectedCategory || q.category === selectedCategory)
          .map((q, idx) => (
            <div key={idx} className="flex items-start gap-2">
              {employeeApproveMode && (
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(idx)}
                  onChange={() => onToggleQuestionSelect(idx)}
                  className="mt-6"
                />
              )}
              <div
                onClick={() => employeeApproveMode && onToggleQuestionSelect(idx)}
                className={`flex-1 text-left p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 border ${
                  selectedQuestionIndex === idx || selectQuestionReplace === idx
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between">
                  <div className="font-medium text-gray-800 mb-1">Question {idx + 1}</div>
                  {!employeeApproveMode && (
                    <div className="flex gap-2">
                      <div className="flex gap-2 mt-2">
                        <button
                          className={`px-3 py-1 rounded-md text-sm transition-all ${
                            selectedQuestionIndex === idx
                              ? 'underline text-blue-600 font-semibold'
                              : 'text-gray-700'
                          } hover:underline hover:text-blue-600`}
                          onClick={() => {
                            onSelectQuestionReplace(null);
                            onSelectQuestion(idx);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className={`px-3 py-1 rounded-md text-sm transition-all ${
                            selectQuestionReplace === idx
                              ? 'underline text-purple-600 font-semibold'
                              : 'text-gray-700'
                          } hover:underline hover:text-purple-600`}
                          onClick={() => {
                            onSelectQuestion(null);
                            onSelectQuestionReplace(idx);
                          }}
                        >
                          Replace
                        </button>

                        <button
                          className="px-3 py-1 rounded-md text-sm text-red-600 hover:underline transition-all hover:text-red-700"
                          onClick={() => {
                            onSelectQuestionDelete(idx);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">{q.question}</div>
                <div className="text-xs text-indigo-600 font-medium mb-2">
                  Category: {q.category}
                </div>
                <div className="text-sm font-bold mt-1 text-gray-500">Options</div>
                {q?.options?.map((option, index) => (
                  <div
                    key={option}
                    className={`text-gray-600 text-sm line-clamp-2 ${
                      option === q.options[q.answer] ? 'font-bold' : ''
                    }`}
                  >
                    {`(${numToAlpha(index)}) ${option}`}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  employeeApproveMode,
  selectedQuestionIndex,
}) {
  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex items-center w-1/4 justify-center">
        <p className="text-gray-500 text-lg">Select a question to edit</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Question {index + 1}</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
          <textarea
            value={question.question}
            onChange={(e) => onQuestionChange(index, e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
          />
        </div>

        {question.image && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
            <img src={question.image} alt="Question" className="w-[20%] rounded-lg shadow-sm" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <input
            type="text"
            value={question.category}
            disabled
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
          />
        </div>

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
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {question.options?.map((option, i) => (
              <option key={i} value={i}>
                Option {String.fromCharCode(65 + i)} - {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [questions, setQuestions] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [empQuestions, setEmpQuestions] = useState([]);
  const [selectQuestionReplace, setSelectQuestionReplace] = useState(null);
  const [selectQuestionDelete, setSelectQuestionDelete] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedQuestionsReject, setSelectedQuestionsReject] = useState([]);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [replaceQuestions, setReplaceQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { quizId } = useParams();
  const employeeApproveMode = quizId === undefined;
  const navigate = useNavigate();

  const onSelectQuestionDelete = async (idx) => {
    const questionToDelete = questions[idx];
    try {
      await deleteQuestionAPI(questionToDelete._id, quizId, questionToDelete.category);
      setQuestions((prev) => prev.filter((q) => q._id !== questionToDelete._id));
    } catch (err) {
      console.error('Error deleting question', err);
    }
  };

  const handleApproveSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.info('Please select questions to approve');
      return;
    }

    const updatedQuestions = questions.filter((_, idx) => !selectedQuestions.includes(idx));
    const questionsToApprove = questions.filter((_, idx) => selectedQuestions.includes(idx));
    setQuestions(updatedQuestions);
    await approveEmployeeQuestionsAPI(questionsToApprove);
    setSelectedQuestions([]);

    toast.success(`${selectedQuestions.length} question(s) approved`);
  };

  const handleRejectSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.info('Please select questions to approve');
      return;
    }

    const updatedQuestions = questions.filter((_, idx) => !selectedQuestions.includes(idx));
    const questionsToReject = questions.filter((_, idx) => selectedQuestions.includes(idx));
    setQuestions(updatedQuestions);
    await rejectEmployeeQuestionsAPI(questionsToReject);
    setSelectedQuestions([]);

    toast.warn(`${selectedQuestions.length} question(s) rejected`);
  };

  const handleToggleQuestionSelect = (index) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  useEffect(() => {
    const getQuestionsToApproveFunc = async () => {
      try {
        const response = await fetchScheduledQuizQuestionsAPI(quizId);
        if (response.status === 400) {
          toast.info('No questions found');
          navigate('/dashboard');
          return;
        }
        setQuestions(response.data.weeklyQuizQuestions);
        setAiQuestions(response.data.extraAIQuestions);
        setEmpQuestions(response.data.extraEmployeeQuestions);
      } catch (error) {
        toast.error('Failed to load questions');
      }
    };
    const getEmployeeQuestionsToApproveFunc = async () => {
      try {
        const response = await fetchEmployeeQuestionsToApproveAPI();
        if (response.status === 400) {
          toast.info('No questions found');
          navigate('/dashboard');
          return;
        }
        setQuestions(response.data);
      } catch (error) {
        toast.error('Failed to load questions');
      }
    };

    employeeApproveMode ? getEmployeeQuestionsToApproveFunc() : getQuestionsToApproveFunc();
  }, [employeeApproveMode, quizId, navigate]);

  const handleReplaceQuestion = (type, newQuestion, index) => {
    if (index === null) {
      toast.info('Please select a question to replace first');
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions[index] = newQuestion;
    setQuestions(updatedQuestions);

    if (type === 'ai') {
      setAiQuestions(aiQuestions.filter((q) => q !== newQuestion));
    } else {
      setEmpQuestions(empQuestions.filter((q) => q !== newQuestion));
    }

    setReplaceQuestions((prev) => {
      return [...prev, [questions[index]._id, newQuestion._id]];
    });

    toast.success('Question replaced successfully');
  };

  const handleQuestionChange = (idx, newQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].question = newQuestion;
    setQuestions(updatedQuestions);

    setEditedQuestions((prev) => {
      const existingIdx = prev.findIndex((q) => q.id === updatedQuestions[idx].id);
      if (existingIdx !== -1) {
        prev[existingIdx] = updatedQuestions[idx];
        return [...prev];
      }
      return [...prev, updatedQuestions[idx]];
    });
  };

  const handleOptionChange = (qIdx, optionIdx, newOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIdx].options[optionIdx] = newOption;
    setQuestions(updatedQuestions);

    setEditedQuestions((prev) => {
      const existingIdx = prev.findIndex((q) => q.id === updatedQuestions[qIdx].id);
      if (existingIdx !== -1) {
        prev[existingIdx] = updatedQuestions[qIdx];
        return [...prev];
      }
      return [...prev, updatedQuestions[qIdx]];
    });
  };

  const handleCorrectAnswerChange = (idx, correctOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].answer = parseInt(correctOption, 10);
    setQuestions(updatedQuestions);

    setEditedQuestions((prev) => {
      const existingIdx = prev.findIndex((q) => q.id === updatedQuestions[idx].id);
      if (existingIdx !== -1) {
        prev[existingIdx] = updatedQuestions[idx];
        return [...prev];
      }
      return [...prev, updatedQuestions[idx]];
    });
  };

  const handleApproveQuiz = async () => {
    try {
      await editWeeklyQuizAPI(editedQuestions, replaceQuestions, quizId);
      toast.success('Quiz updated successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update quiz');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mb-6 flex justify-between items-center">
        {employeeApproveMode ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800">Approve Questions</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedQuestions.length} question(s) selected
              </span>
              <button
                onClick={handleApproveSelectedQuestions}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedQuestions.length === 0}
              >
                Approve Selected
              </button>
              <button
                onClick={handleRejectSelectedQuestions}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedQuestions.length === 0}
              >
                Reject Selected
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-slate-400 text-white rounded-md hover:bg-red-500 transition duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800">Question Editor</h1>
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-slate-400 text-white rounded-md hover:bg-red-500 transition duration-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleApproveQuiz}
                className="px-6 py-2 ml-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 font-medium"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-6">
        <QuestionList
          questions={questions}
          onSelectQuestion={setSelectedQuestionIndex}
          onSelectQuestionReplace={setSelectQuestionReplace}
          selectQuestionReplace={selectQuestionReplace}
          onSelectQuestionDelete={onSelectQuestionDelete}
          selectQuestionDelete={selectQuestionDelete}
          selectedQuestionIndex={selectedQuestionIndex}
          selectedQuestions={selectedQuestions}
          onToggleQuestionSelect={handleToggleQuestionSelect}
          employeeApproveMode={employeeApproveMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        {!employeeApproveMode && !selectQuestionReplace && selectedQuestionIndex !== null && (
          <QuestionEditor
            question={selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null}
            index={selectedQuestionIndex}
            onQuestionChange={handleQuestionChange}
            onOptionChange={handleOptionChange}
            onCorrectAnswerChange={handleCorrectAnswerChange}
            selectedQuestionIndex={selectedQuestionIndex}
            employeeApproveMode={employeeApproveMode}
          />
        )}
        {!employeeApproveMode && !selectedQuestionIndex && selectQuestionReplace !== null && (
          <ExtraQuestions
            aiQuestions={aiQuestions}
            empQuestions={empQuestions}
            onReplaceQuestion={handleReplaceQuestion}
            selectedQuestionIndex={selectQuestionReplace}
          />
        )}
      </div>
    </div>
  );
}

export default App;
