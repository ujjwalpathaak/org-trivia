import React, { useState, useEffect } from 'react';
import { getWeeklyQuizQuestionsAPI, submitWeeklyQuizAnswersAPI } from '../api';
import { toast } from 'react-toastify';
import { Loader, Clock, CheckCircle, Coins } from 'lucide-react';

const Quiz = ({ setQuizStatus, setIsQuizOpen }) => {
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState({
    multiplier: -1,
    score: -1,
    points: -1,
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizId, setQuizId] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [timeLeftCurrentQuestion, setTimeLeftCurrentQuestion] = useState(5);

  useEffect(() => {
    const getLiveQuizState = async (quizId) => {
      try {
        const quizState = localStorage.getItem('state');
        const quizStateJSON = JSON.parse(quizState);
        if (quizStateJSON) {
          if (quizStateJSON.quizId !== quizId) {
            localStorage.removeItem('state');
          } else {
            setIsQuizFinished(quizStateJSON.isQuizFinished);
            setCurrentQuestion(quizStateJSON.currentQuestion);
          }
        }
      } catch (error) {
        console.error('Error checking quiz status:', error);
      }
    };

    const fetchWeeklyQuizQuestions = async () => {
      let response = await getWeeklyQuizQuestionsAPI();
      setQuizId(response.quizId);
      getLiveQuizState(response.quizId);
      setQuestions(response.weeklyQuizQuestions);
    };

    fetchWeeklyQuizQuestions();
  }, []);

  useEffect(() => {
    if (isQuizFinished || questions.length === 0) return;
    setTimeLeftCurrentQuestion(900);

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

  const notifyAnswersSubmitted = () => toast.success('Answers Submitted!');

  const handleAnswer = (option) => {
    const newAnswer = {
      questionId: questions[currentQuestion]._id,
      answer: option,
    };

    let quizState = JSON.parse(localStorage.getItem('state')) || {
      answers: [],
      currentQuestion: 0,
    };
    quizState.answers.push(newAnswer);

    const state = {
      quizId: quizId,
      answers: quizState.answers,
      currentQuestion: currentQuestion + 1,
      isQuizFinished: currentQuestion + 1 === questions.length,
    };
    localStorage.setItem('state', JSON.stringify(state));

    handleNextQuestion();
  };

  const handleSubmitAnswers = async () => {
    const state = localStorage.getItem('state');
    const optionsSelected = JSON.parse(state);
    if (currentQuestion >= questions.length - 1) {
      if (optionsSelected.answers) {
        const response = await submitWeeklyQuizAnswersAPI(optionsSelected.answers, quizId);
        setResult({
          ...response.data,
        });
        localStorage.removeItem('state');
      }
      notifyAnswersSubmitted();
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
    <div className="col-span-5 bg-white floating-div h-fit rounded-2xl p-6">
      <div className="flex justify-between items-center w-full mb-4">
        <p className="text-lg font-semibold">
          Question {currentQuestion + 1}/{questions.length}
        </p>
        <p className="text-red-500 flex items-center gap-2">
          <Clock className="w-5 h-5" /> {timeLeftCurrentQuestion}s
        </p>
      </div>
      <div className="w-full p-4 rounded-lg text-center">
        {isQuizFinished ? (
          <>
            {result?.score !== -1 ? (
              <div className="flex flex-col items-center">
                <Coins className="w-12 h-12 text-blue-500" />
                <span className="text-xl mt-2">Your Points: {result.points || 0}</span>
                <span className="text-xl mt-2">Your Multiplier: x{result.multiplier || 0}</span>
                <span className="text-xl mt-2">Your Score: {result.score || 0}</span>
                <button
                  onClick={() => {
                    setIsQuizOpen(false);
                    setQuizStatus(2);
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Close Quiz
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <button
                  onClick={handleSubmitAnswers}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Submit Quiz
                </button>
              </div>
            )}
          </>
        ) : questions.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold mb-2">{questions[currentQuestion]?.question}</h3>
            {questions[currentQuestion]?.image && (
              <img
                className="w-2/3 max-w-xs mx-auto mt-4 rounded-md shadow-sm"
                src={questions[currentQuestion]?.image}
                alt="Question"
              />
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {questions[currentQuestion]?.options?.map((option, index) => (
                <div
                  key={index}
                  className="border-2 p-3 rounded-lg cursor-pointer hover:bg-slate-200 transition-all text-lg font-medium"
                  onClick={() => handleAnswer(index)}
                >
                  {`(${String.fromCharCode(65 + index)}) ${option}`}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 animate-spin" />
            <p className="mt-2">Loading questions...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
