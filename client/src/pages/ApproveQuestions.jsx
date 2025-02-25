import { useEffect, useState } from "react";
import { getQuestionsToApprove } from "../services.js";
import { useOrgId } from "../context/auth.context.jsx";

export default function ScheduleQuestions() {
  const [aiQuestions, setAiQuestions] = useState([
    {
      question: "AI Question 1",
      options: ["Option 1", "Option 2"],
      correctAnswer: "Option 1",
    },
    {
      question: "AI Question 2",
      options: ["Option A", "Option B"],
      correctAnswer: "Option B",
    },
  ]);
  const [empQuestions, setEmpQuestions] = useState([
    {
      question: "Emp Question 1",
      options: ["Yes", "No"],
      correctAnswer: "Yes",
    },
  ]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // ----------------------------------------------------------
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [questions, setQuestions] = useState([]);
  const orgId = useOrgId();

  useEffect(() => {
    const getQuestionsToApproveFunc = async () => {
      const response = await getQuestionsToApprove(orgId);
      setQuestions(response.questions);
    };

    getQuestionsToApproveFunc();
  }, []);

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions([
        ...customQuestions,
        { question: newQuestion, options: [], correctAnswer: "" },
      ]);
      setNewQuestion("");
    }
  };

  const handleFileUpload = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const generateAIQuestion = () => {
    const aiGeneratedQuestion = "Generated AI Question";
    setCustomQuestions([
      ...customQuestions,
      { question: aiGeneratedQuestion, options: [], correctAnswer: "" },
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h3 className="font-semibold mt-4">AI Questions</h3>
        {aiQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => selectQuestion(q)}
            className="block p-2 border rounded-md mt-1"
          >
            {q.question}
          </button>
        ))}
        <h3 className="font-semibold mt-4">New Question</h3>
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Type a question"
          className="border p-2 rounded-md w-full"
        />
        <button
          onClick={addCustomQuestion}
          className="mt-2 p-2 border rounded-md bg-blue-500 text-white"
        >
          Add
        </button>
        <input type="file" onChange={handleFileUpload} className="mt-2" />
        <button
          onClick={generateAIQuestion}
          className="mt-2 p-2 border rounded-md bg-green-500 text-white"
        >
          Generate AI Question
        </button>
        <h3 className="font-semibold mt-4">Employee Questions</h3>
        {empQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => selectQuestion(q)}
            className="block p-2 border rounded-md mt-1"
          >
            {q.question}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-6 flex-1">
        <h2 className="text-xl font-bold">Schedule Questions</h2>
        <input
          type="week"
          className="border rounded-md p-2"
          onChange={(e) => setSelectedWeek(e.target.value)}
        />
        {selectedWeek && <p>Selected Week: {selectedWeek}</p>}

        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-semibold">Selected Questions (Max 5)</h3>
          {questions.map((q, idx) => (
            <div key={idx} className="mt-2 p-2 border rounded-md">
              {/* Editable Question */}
              <input
                type="text"
                value={q.question.question}
                onChange={(e) => handleQuestionChange(idx, e.target.value)}
                className="w-full p-2 border rounded-md"
              />

              {/* Editable Options */}
              <div className="mt-2">
                {q.question.options.map((option, i) => (
                  <input
                    key={i}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, i, e.target.value)}
                    className="w-full p-1 border rounded-md mb-1"
                  />
                ))}
              </div>

              {/* Correct Answer Dropdown */}
              <select
                value={q.correctAnswer || ""}
                onChange={(e) => handleCorrectAnswerChange(idx, e.target.value)}
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
          ))}
        </div>
      </div>
    </div>
  );
}
