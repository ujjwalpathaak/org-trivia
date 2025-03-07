import { useEffect, useRef, useState } from 'react';
import { getQuestionsToApprove, handleApproveWeeklyQuiz } from '../api.js';
import { useOrgId } from '../context/auth.context.jsx';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

export default function ScheduleQuestions() {
  const [aiQuestions, setAiQuestions] = useState([
    {
      question:
        "One morning, Udai and Vishal were facing each other at a crossing. If Vishal's shadow was exactly to the left of Udai, which direction was Udai facing?",
      options: ['Option 1', 'Option 2'],
      correctAnswer: 'Option 1',
    },
    {
      question:
        'A Google employee receives ₹480 as expense reimbursement in ₹1, ₹5, and ₹10 notes. The number of notes of each denomination is the same. What is the total number of notes the employee received?',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option B',
    },
  ]);
  const [empQuestions, setEmpQuestions] = useState([
    {
      question: 'How many triangles are present in the given diagram?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
  ]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const getNextWeek = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const year = today.getFullYear();
    const week = Math.ceil(
      ((today - new Date(year, 0, 1)) / 86400000 +
        new Date(year, 0, 1).getDay() +
        1) /
        7,
    );
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------------
  const [selectedWeek, setSelectedWeek] = useState(getNextWeek);
  const [questions, setQuestions] = useState([]);
  const orgId = useOrgId();

  const noQuestionFound = () => toast('No questions found to approve');
  const toastShownRef = useRef(false);

  useEffect(() => {
    const getQuestionsToApproveFunc = async () => {
      const response = await getQuestionsToApprove(orgId);
      if (response.status === 404) {
        if (!toastShownRef.current) {
          noQuestionFound();
          toastShownRef.current = true;
        }
        navigate('/dashboard');
        return;
      }
      setQuestions(response.data);
    };

    getQuestionsToApproveFunc();
  }, []);

  const handleApproveQuiz = async () => {
    // Schedule the quiz here
    await handleApproveWeeklyQuiz(questions, orgId);
    toast.success('Quiz approved successfully');
    navigate('/dashboard');
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([
        ...customQuestions,
        { question: newQuestion, options: [], correctAnswer: '' },
      ]);
      setNewQuestion('');
    }
  };

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const generateAIQuestion = () => {
    const aiGeneratedQuestion = 'Generated AI Question';
    setCustomQuestions([
      ...customQuestions,
      { question: aiGeneratedQuestion, options: [], correctAnswer: '' },
    ]);
  };

  const selectQuestion = (question) => {
    if (questions.length < 5 && !questions.includes(question)) {
      setQuestions([...questions, question]);
    }
  };

  const handleQuestionChange = (idx, newQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].question = newQuestion;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIdx, optionIdx, newOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIdx].options[optionIdx] = newOption;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (idx, correctOption) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx].correctAnswer = correctOption;
    setQuestions(updatedQuestions);
  };

  return (
    <div className="flex bg-[#f2f9ff] jusitfy-center items-center h-[93vh] gap-6 mt-0">
      <div className="w-1/3 bg-white floating-div h-[90%] p-6 flex-1 ml-6 overflow-auto floating-div">
        <h2 className="text-xl font-bold">Add a new Question</h2>
        <div className="overflow-y-auto h-[95%]">
          <div className="mt-4 p-4 border rounded-md bg-slate-50 mx-2">
            <h3 className="font-semibold mt-4">Make Question from AI</h3>
            <div className="flex flex-col">
              <input type="file" onChange={handleFileUpload} className="mt-2" />
              <button
                onClick={generateAIQuestion}
                className="mt-2 bg-slate-200 hover:bg-green-500 p-2 border rounded-md"
              >
                Generate AI Question
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 border rounded-md bg-slate-50 mx-2">
            <h3 className="font-semibold">AI Questions</h3>
            {aiQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectQuestion(q)}
                className="text-justify bg-white block p-2 border rounded-md mt-1"
              >
                {q.question}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 border rounded-md bg-slate-50 mx-2">
            <h3 className="font-semibold mt-4">Employee Questions</h3>
            {empQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectQuestion(q)}
                className="block bg-white p-2 border rounded-md mt-1"
              >
                {q.question}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 border rounded-md bg-slate-50 mx-2">
            <h3 className="font-semibold mb-4 mt-4">Custom Question</h3>
            <div className="flex flex-col">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type a question"
                className="mb-2 border p-2 overflow-auto resize-none rounded-md w-full"
              />
              <span>Options: </span>
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Option A"
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Option B"
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Option C"
              />
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Option D"
              />
              <span>Answer: </span>
              <select className="w-full p-2 border rounded-md mb-2">
                <option>Option A</option>
                <option>Option B</option>
                <option>Option C</option>
                <option>Option D</option>
              </select>
              <div className="flex">
                <button
                  onClick={addCustomQuestion}
                  className="m-2 w-1/2 bg-slate-200 hover:bg-green-500 p-2 border rounded-md"
                >
                  Refactor using AI
                </button>
                <button
                  onClick={addCustomQuestion}
                  className="m-2 w-1/2 bg-slate-200 hover:bg-green-500 p-2 border rounded-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`p-6 max-w-6xl bg-white h-[90%] floating-div mx-auto flex-1`}
      >
        <h2 className="text-xl font-bold flex justify-between">
          Questions for {selectedWeek}
          <button
            onClick={handleApproveQuiz}
            className="border-2 hover:bg-slate-200 p-2 rounded-md ml-6"
          >
            Schedule Quiz
          </button>
        </h2>
        <div className="mt-4 p-4 border overflow-auto h-[85%] floating-div">
          {questions.map((q, idx) => (
            <>
              <div className="font-bold m-4">{`Question: ${idx + 1}`}</div>
              <div key={idx} className="bg-slate-50 p-4 border">
                {/* Editable Question */}
                <div className="flex justify-end">
                  <button className="bg-slate-200 rounded-full w-8 h-8 hover:bg-red-200">
                    X
                  </button>
                </div>
                <textarea
                  value={q.question.question}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                  className="w-full p-2 border mt-2 rounded-md resize-none overflow-hidden h-[150px] transition-all duration-200"
                />
                {q.question.image && (
                  <img className="w-1/2" src={q.question.image} />
                )}
                {/* Editable Options */}
                <div className="mt-2">
                  {q.question.options.map((option, i) => (
                    <input
                      key={i}
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(idx, i, e.target.value)
                      }
                      className="w-full p-2 border rounded-md mb-2"
                    />
                  ))}
                </div>
                {/* Correct Answer Dropdown */}
                <select
                  value={q.correctAnswer || ''}
                  onChange={(e) =>
                    handleCorrectAnswerChange(idx, e.target.value)
                  }
                  className="mt-2 p-2 border rounded-md w-full"
                >
                  <option value="">Select Correct Answer</option>
                  {q.question.options.map((option, i) => (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
