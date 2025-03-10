import { useEffect, useRef, useState } from 'react';
import { getQuestionsToApprove, handleApproveWeeklyQuiz } from '../api.js';
import { useOrgId } from '../context/auth.context.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PlusCircle,
  X,
  Upload,
  Wand2,
  Save,
  CalendarCheck,
} from 'lucide-react';

export default function ScheduleQuestions() {
  // State management
  const [aiQuestions] = useState([
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

  const [empQuestions] = useState([
    {
      question: 'How many triangles are present in the given diagram?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
    },
  ]);

  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [addQuestion, setAddQuestion] = useState(false);
  const [removedQuestionIndex, setRemovedQuestionIndex] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
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
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const navigate = useNavigate();
  const orgId = useOrgId();
  const toastShownRef = useRef(false);

  // Effects
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestionsToApprove(orgId);
        if (response.status === 404) {
          if (!toastShownRef.current) {
            toast('No pending questions found');
            toastShownRef.current = true;
          }
          navigate('/dashboard');
          return;
        }
        setQuestions(response.data);
      } catch (error) {
        toast.error('Failed to fetch questions');
      }
    };

    fetchQuestions();
  }, [orgId, navigate]);

  // Event handlers
  const handleApproveQuiz = async () => {
    try {
      // Filter out null questions (removed ones)
      const filteredQuestions = questions.filter((q) => q !== null);
      await handleApproveWeeklyQuiz(filteredQuestions, orgId);
      toast.success('Quiz approved successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to approve quiz');
    }
  };

  const handleQuestionChangeType = (idx, newQuestionText) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[idx] && updatedQuestions[idx].question) {
      updatedQuestions[idx].question.question = newQuestionText;
      setQuestions(updatedQuestions);
    }
  };

  const handleOptionChange = (qIdx, optionIdx, newOption) => {
    const updatedQuestions = [...questions];
    if (
      updatedQuestions[qIdx] &&
      updatedQuestions[qIdx].question &&
      updatedQuestions[qIdx].question.options
    ) {
      updatedQuestions[qIdx].question.options[optionIdx] = newOption;
      setQuestions(updatedQuestions);
    }
  };

  const handleCorrectAnswerChange = (idx, correctOption) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[idx] && updatedQuestions[idx].question) {
      updatedQuestions[idx].question.answer = parseInt(correctOption, 10);
      setQuestions(updatedQuestions);
    }
  };

  const handleQuestionRemove = (idx) => {
    const updatedQuestions = [...questions];
    updatedQuestions[idx] = null;
    setAddQuestion(true);
    setRemovedQuestionIndex(idx);
    setQuestions(updatedQuestions);
  };

  const handleNewOptionChange = (index, value) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      // Filter out empty options
      const filteredOptions = newOptions.filter((opt) => opt.trim() !== '');

      // Only add if we have at least two options
      if (filteredOptions.length >= 2) {
        const newCustomQuestion = {
          question: {
            question: newQuestion,
            options: filteredOptions,
            answer: newCorrectAnswer,
          },
        };

        if (removedQuestionIndex !== null) {
          // Replace the removed question
          const updatedQuestions = [...questions];
          updatedQuestions[removedQuestionIndex] = newCustomQuestion;
          setQuestions(updatedQuestions);
          setRemovedQuestionIndex(null);
        } else {
          // Add as a new question
          setQuestions([...questions, newCustomQuestion]);
        }

        // Reset form
        setNewQuestion('');
        setNewOptions(['', '', '', '']);
        setNewCorrectAnswer(0);
        setAddQuestion(false);
      } else {
        toast.error('Please add at least two options');
      }
    } else {
      toast.error('Please enter a question');
    }
  };

  const selectQuestion = (question) => {
    // Convert from aiQuestions/empQuestions format to questions format
    const formattedQuestion = {
      question: {
        question: question.question,
        options: question.options,
        answer: question.options.indexOf(question.correctAnswer),
      },
    };

    if (removedQuestionIndex !== null) {
      // Replace the removed question
      const updatedQuestions = [...questions];
      updatedQuestions[removedQuestionIndex] = formattedQuestion;
      setQuestions(updatedQuestions);
      setRemovedQuestionIndex(null);
      setAddQuestion(false);
    } else {
      // Add as a new question
      setQuestions([...questions, formattedQuestion]);
      setAddQuestion(false);
    }
  };

  // UI Components
  const QuestionCard = ({ question, index }) => {
    // Check if question exists and has the expected structure
    if (!question || !question.question) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question {index + 1}
          </h3>
          <button
            onClick={() => handleQuestionRemove(index)}
            className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <textarea
          value={question.question.question || ''}
          onChange={(e) => handleQuestionChangeType(index, e.target.value)}
          className="w-full p-3 border rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {question.question.image && (
          <img
            src={question.question.image}
            alt="Question"
            className="w-1/2 max-w-64 rounded-lg mb-4"
          />
        )}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Options:</h4>
          {(question.question.options || []).map((option, i) => (
            <input
              key={i}
              type="text"
              value={option || ''}
              onChange={(e) => handleOptionChange(index, i, e.target.value)}
              className={`w-full p-3 border rounded-lg ${
                i === question.question.answer
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-gray-200'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          ))}
        </div>
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
          <select
            value={question.question.answer || 0}
            onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {(question.question.options || []).map((option, i) => (
              <option key={i} value={i}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const QuestionBank = () => (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold mb-6">Question Bank</h2>

      <div className="space-y-6 overflow-y-auto h-[90%]">
        <section className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Upload Question</h3>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border cursor-pointer hover:bg-gray-50"
            >
              <Upload size={20} />
              <span>Choose file</span>
            </label>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Wand2 size={20} />
              <span>Generate AI Question</span>
            </button>
          </div>
        </section>

        <section className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">AI Questions</h3>
          <div className="space-y-2">
            {aiQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectQuestion(q)}
                className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {q.question}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Employee Questions</h3>
          <div className="space-y-2">
            {empQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectQuestion(q)}
                className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {q.question}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Custom Question</h3>
          <div className="space-y-4">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <input
                  key={letter}
                  type="text"
                  value={newOptions[index]}
                  onChange={(e) => handleNewOptionChange(index, e.target.value)}
                  placeholder={`Option ${letter}`}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ))}
            </div>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newCorrectAnswer}
              onChange={(e) =>
                setNewCorrectAnswer(parseInt(e.target.value, 10))
              }
            >
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <option key={letter} value={index}>
                  Option {letter}
                </option>
              ))}
            </select>
            <div className="flex space-x-4">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                <Wand2 size={20} />
                <span>Refactor with AI</span>
              </button>
              <button
                onClick={addCustomQuestion}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <PlusCircle size={20} />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 p-6 bg-gray-100 h-[93vh]">
      {addQuestion && (
        <div className="w-1/3">
          <QuestionBank />
        </div>
      )}

      <div className={`flex-1 ${addQuestion ? '' : 'mx-auto max-w-4xl'}`}>
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Questions for {selectedWeek}
            </h2>
            <button
              onClick={handleApproveQuiz}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <CalendarCheck size={20} />
              <span>Schedule Quiz</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[90%] overflow-y-auto">
            {questions.map((q, idx) =>
              q ? (
                <QuestionCard key={idx} question={q} index={idx} />
              ) : (
                <div
                  key={idx}
                  className="bg-gray-100 rounded-lg p-6 text-center"
                >
                  <div className="font-bold text-gray-600 mb-2">
                    Question {idx + 1}
                  </div>
                  <div className="animate-pulse text-gray-500">
                    Adding new question...
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
