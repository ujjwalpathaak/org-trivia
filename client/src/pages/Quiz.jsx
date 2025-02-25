import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    _id: '67b8d31a8f6aae97d0bb14a5',
    source: 'AI',
    category: 'PnA',
    image: null,
    description:
      'Golu starts from his house and walks 8 km north. Then, he turns left and walks 6 km. What is the shortest distance from his house?',
    answer: 0,
    options: ['10 km', '16 km', '14 km', '2 km'],
    status: 'extra',
    org: '67b2fa464f423c3b4c544ca8',
    lastModifiedAt: '2025-02-21T19:25:14.041Z',
    createdAt: '2025-02-21T19:25:14.043Z',
    updatedAt: '2025-02-21T19:25:14.043Z',
    __v: 0,
  },
  {
    _id: '67b9b43814cd6eb39da6ccfe',
    source: 'Employee',
    category: 'CAnIT',
    image: null,
    description: 'sampl question',
    answer: 1,
    options: ['ddd', 'dd', 'd', 'd'],
    status: 'extra',
    org: '67b2fa464f423c3b4c544ca9',
    lastModifiedAt: '2025-02-22T11:25:44.646Z',
    createdAt: '2025-02-22T11:25:44.647Z',
    updatedAt: '2025-02-22T11:25:44.647Z',
    __v: 0,
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (selected) => {
    if (selected === questions[currentQuestion].answer) {
      setScore(showScore + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div className="parent-page-div flex justify-center items-center">
      <div className="max-w-2xl mx-auto p-6 bg-white floating-div rounded-xl">
        {showScore ? (
          <>
            <div>
              <h2 className="text-2xl font-bold">
                Your Score: {score}/{questions.length}
              </h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Go to dashboard
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="border-2 p-2 rounded-lg mb-6">
              {questions[currentQuestion].description}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, optionIndex) => (
                <div
                  className="border-2 p-2 rounded-lg"
                  onClick={() => handleAnswer(optionIndex)}
                >
                  {`(${String.fromCharCode(65 + optionIndex)}) ${option}`}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
