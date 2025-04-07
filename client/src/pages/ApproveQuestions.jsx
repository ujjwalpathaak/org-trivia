import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizDetailsAPI, editWeeklyQuizAPI } from '../api.js';

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

function QuestionList({ questions, onSelectQuestion, selectedQuestionIndex }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-2/4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Scheduled Questions</h2>
      <div className="space-y-2 overflow-auto max-h-[calc(100vh-12rem)]">
        {questions.length === 0 && (
          <span className="italic text-slate-400">No questions found</span>
        )}
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(idx)}
            className={`w-full text-left p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200 border ${
              selectedQuestionIndex === idx
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="font-medium text-gray-800 mb-1">Question {idx + 1}</div>
            <div className="text-gray-600 text-sm line-clamp-2">{q.question}</div>
            <div className="text-sm font-bold mt-1 text-gray-500">Options</div>
            {q?.options?.map((option, index) => {
              return (
                <div
                  key={option}
                  className={`text-gray-600 text-sm line-clamp-2 ${
                    option === q.options[q.answer] ? 'font-bold' : ''
                  }`}
                >
                  {`(${numToAlpha(index)}) ${option}`}
                </div>
              );
            })}
          </button>
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
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getQuestionsToApproveFunc = async () => {
      try {
        const response = await fetchQuizDetailsAPI(quizId);
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

    getQuestionsToApproveFunc();
  }, [quizId, navigate]);

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

    setEditedQuestions((prev) => [...prev, newQuestion.question]);
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
    if (editedQuestions.length === 0) {
      toast.info('No changes detected');
      return;
    }

    try {
      await editWeeklyQuizAPI(editedQuestions);
      toast.success('Quiz updated successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to update quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mb-6 flex justify-between items-center">
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
      </div>

      <div className="flex gap-6">
        <QuestionList
          questions={questions}
          onSelectQuestion={setSelectedQuestionIndex}
          selectedQuestionIndex={selectedQuestionIndex}
        />
        <QuestionEditor
          question={selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null}
          index={selectedQuestionIndex}
          onQuestionChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onCorrectAnswerChange={handleCorrectAnswerChange}
          selectedQuestionIndex={selectedQuestionIndex}
        />
        <ExtraQuestions
          aiQuestions={aiQuestions}
          empQuestions={empQuestions}
          onReplaceQuestion={handleReplaceQuestion}
          selectedQuestionIndex={selectedQuestionIndex}
        />
      </div>
    </div>
  );
}

export default App;
