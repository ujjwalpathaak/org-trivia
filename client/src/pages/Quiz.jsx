import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeeklyQuizQuestions, submitWeeklyQuizAnswers } from '../api';
import { useOrgId, useUserId } from '../context/auth.context';

import { toast } from 'react-toastify';

const Quiz = () => {
  const navigate = useNavigate();
  const orgId = useOrgId();
  const userId = useUserId();

  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [timeLeftCurrentQuestion, setTimeLeftCurrentQuestion] = useState(5);

  useEffect(() => {
    const fetchWeeklyQuizQuestions = async () => {
      if (!orgId || !userId) return;
      let response = await getWeeklyQuizQuestions(orgId);
      setQuestions(response);
    };

    fetchWeeklyQuizQuestions();
  }, [orgId, userId]);

  useEffect(() => {
    if (isQuizFinished || questions.length === 0) return;
    setTimeLeftCurrentQuestion(5);

    const timer = setInterval(() => {
      setTimeLeftCurrentQuestion((prev) => {
        if (prev === 1) {
          handleNextQuestion();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isQuizFinished, questions.length]);

  const notifyAnswersSubmitted = () => toast('Answers Submitted!');

  const handleAnswer = (option) => {
    const newAnswer = {
      questionId: questions[currentQuestion]._id,
      answer: option,
    };

    let storedAnswers = JSON.parse(localStorage.getItem('answers')) || [];

    const updatedAnswers = [...storedAnswers, newAnswer];

    setAnswers(updatedAnswers);
    localStorage.setItem('answers', JSON.stringify(updatedAnswers));

    handleNextQuestion();
  };

  const handleSubmitAnswers = async () => {
    if (currentQuestion === questions.length - 1) {
      const optionsSelected = localStorage.getItem('answers');
      if (optionsSelected) {
        await submitWeeklyQuizAnswers(optionsSelected, orgId, userId, quizId);
        localStorage.removeItem('answers');
      }
      notifyAnswersSubmitted();
      navigate('/dashboard');
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setIsQuizFinished(true);
    }
  };

  return (
    <div className="parent-page-div flex justify-center items-center">
      <div className="max-w-2xl mx-auto p-6 bg-white floating-div rounded-xl">
        {isQuizFinished ? (
          <div>
            <button
              onClick={handleSubmitAnswers}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Are you sure you want to submit your quiz?
            </button>
          </div>
        ) : questions.length > 0 ? (
          <>
            <div className="border-2 p-2 rounded-lg mb-6">
              <h3 className="text-lg font-semibold">
                {questions[currentQuestion]?.question}
              </h3>
              <p className="mt-2 text-red-500">
                Time Left: {timeLeftCurrentQuestion} sec
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {questions[currentQuestion]?.options?.map((option, index) => (
                <div
                  key={index}
                  className="border-2 p-2 rounded-lg cursor-pointer hover:bg-gray-200"
                  onClick={() => handleAnswer(index)}
                >
                  {`(${String.fromCharCode(65 + index)}) ${option}`}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Loading questions...</p>
        )}
      </div>
    </div>
  );
};

export default Quiz;
