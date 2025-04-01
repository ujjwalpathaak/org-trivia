import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getQuestionsToApproveAPI, handleApproveWeeklyQuizAPI } from '../api.js';
import { getNextWeek } from '../utils.js';

export default function ScheduleQuestions() {
  const [aiQuestions, setAiQuestions] = useState([]);

  const [empQuestions, setEmpQuestions] = useState([]);
  const { quizId } = useParams();
  const [addQuestion, setAddQuestion] = useState(false);
  const [removedQuestionIndex, setRemovedQuestionIndex] = useState(-1);
  const [questions, setQuestions] = useState([]);
  const [questionsToDelete, setQuestionsToDelete] = useState([]);

  const navigate = useNavigate();
  const selectedWeek = getNextWeek();

  const noQuestionFound = () => toast.info('No pending questions found');

  const [tempRemovedQuestion, setTempRemovedQuestion] = useState(null);

  const handleQuestionRemove = (idx) => {
    // if (isAI) setUsingAI(true);
    setTempRemovedQuestion({ index: idx, question: questions[idx] });
    const updatedQuestions = [...questions];
    updatedQuestions[idx] = { question: null };
    setAddQuestion(true);
    setRemovedQuestionIndex(idx);
    setQuestions(updatedQuestions);
  };

  const cancelRemoval = () => {
    if (tempRemovedQuestion) {
      const updatedQuestions = [...questions];
      updatedQuestions[tempRemovedQuestion.index] = tempRemovedQuestion.question;
      setQuestions(updatedQuestions);
      setAddQuestion(false);
      setRemovedQuestionIndex(-1);
      setTempRemovedQuestion(null);
    }
  };

  useEffect(() => {
    const getQuestionsToApproveFunc = async () => {
      const response = await getQuestionsToApproveAPI(quizId);
      if (response.status === 400) {
        noQuestionFound();
        navigate('/dashboard');
        return;
      }
      setAiQuestions(response.data.weeklyQuestions.filter((q) => q.type === 'extra'));
      setQuestions(response.data.weeklyQuestions.filter((q) => q.type === 'main'));
      setEmpQuestions(response.data.extraEmployeeQuestions);
    };

    getQuestionsToApproveFunc();
  }, []);

  const handleApproveQuiz = async () => {
    if (addQuestion) {
      toast.error(`Not all questions are selected`);
    } else {
      await handleApproveWeeklyQuizAPI(questions, [...questionsToDelete, ...aiQuestions]);
      toast.success('Quiz approved successfully');
      navigate('/dashboard');
    }
  };

  const selectQuestion = (question) => {
    if (!addQuestion) return;
    const isDuplicate = questions.some((q) => q.question === question);
    if (isDuplicate) {
      toast.error('This question is already selected!');
      return;
    }
    if (question.question.source === 'AI') {
      setAiQuestions(aiQuestions.filter((q) => q.question !== question.question));
    } else if (question.question.source === 'Employee') {
      setEmpQuestions(empQuestions.filter((q) => q.question !== question.question));
    }
    const updatedQuestions = [...questions];
    updatedQuestions[removedQuestionIndex] = question;
    setAddQuestion(false);
    setQuestionsToDelete([...questionsToDelete, tempRemovedQuestion.question]);
    setRemovedQuestionIndex(-1);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChangeType = (idx, newQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].question.question = newQuestion;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIdx, optionIdx, newOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIdx].question.options[optionIdx] = newOption;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (idx, correctOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].question.answer = parseInt(correctOption, 10);
    setQuestions(updatedQuestions);
  };

  // const handleQuestionRemove = (idx) => {
  //   const updatedQuestions = [...questions];
  //   updatedQuestions[idx].question = null;
  //   setAddQuestion(true);
  //   setRemovedQuestionIndex(idx);
  //   setQuestions(updatedQuestions);
  // };

  return (
    <div className="h-[93vh] bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex gap-6 h-full">
        <div
          className={`w-1/3 bg-white rounded-xl shadow-lg p-6 flex-1 ${
            !addQuestion ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Extra Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">AI Questions</h3>
              <div className="space-y-2 overflow-auto max-h-[19rem]">
                {aiQuestions?.length === 0 && (
                  <span className="italic text-slate-400">No extra questions found</span>
                )}
                {aiQuestions?.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => addQuestion && selectQuestion(q)}
                    className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-200"
                  >
                    {q.question.question}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Employee Questions</h3>
              <div className="space-y-2 overflow-auto max-h-[19rem]">
                {empQuestions.length === 0 && (
                  <span className="italic text-slate-400">No extra questions found</span>
                )}
                {empQuestions?.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => !isDisabled && selectQuestion(q)}
                    className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 border border-gray-200"
                  >
                    {q.question.question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex-1/2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Questions for {selectedWeek}</h2>
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

          <div className="space-y-6 overflow-auto max-h-[calc(100vh-14rem)]">
            {questions?.map((q, idx) => {
              if (q.question) {
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-6 shadow-sm relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Question {idx + 1}</h3>
                      {/* <div className="flex gap-2"> */}
                      {!addQuestion && (
                        <button
                          onClick={() => handleQuestionRemove(idx)}
                          className="w-fit p-3 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-200"
                        >
                          Replace
                        </button>
                      )}
                      {/* <button
                          onClick={() => handleQuestionRemove(idx, true)}
                          className="w-fit p-3 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-200"
                        >
                          Write using AI
                        </button>
                      </div> */}
                    </div>
                    <textarea
                      value={q.question?.question}
                      onChange={(e) => handleQuestionChangeType(idx, e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                    />
                    {q.question?.image && (
                      <img
                        src={q.question.image}
                        alt="Question"
                        className="w-[20%] mx-auto mb-4 rounded-lg shadow-sm"
                      />
                    )}
                    <div className="space-y-4">
                      <p className="font-medium text-gray-700">Options:</p>
                      {q?.question?.options?.map((option, i) => (
                        <input
                          key={i}
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(idx, i, e.target.value)}
                          className={`w-full p-3 border rounded-lg transition duration-200 ${
                            i === q.question.answer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2">Correct Answer:</p>
                      <select
                        value={q.question?.answer || ''}
                        onChange={(e) => handleCorrectAnswerChange(idx, e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {q?.question?.options?.map((option, i) => (
                          <option key={i} value={i}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="bg-gray-100 rounded-lg p-6 animate-pulse">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Question {idx + 1}
                      </h3>
                      {tempRemovedQuestion && (
                        <button
                          onClick={cancelRemoval}
                          className="w-fit mb-2 p-3 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {/* {usingAI && (
                      <div className="w-full mb-4 p-4 bg-gray-100 rounded-lg shadow-md">
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          rows="3"
                          placeholder="Enter a prompt for AI..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                        <button
                          onClick={handleGenerate}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-200"
                        >
                          Generate
                        </button>
                      </div>
                    )} */}
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <p className="text-gray-600 font-medium">Adding new question...</p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
