import React, { useEffect, useState } from 'react';
import { fetchScheduledQuizzesAPI, fetchOrgSettingsAPI, toggleTriviaSettingAPI } from '../api';
import ListManager from '../components/ListManager';

const Settings = () => {
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [settings, setSettings] = useState(null);
  const [questionCountStatus, setQuestionCountStatus] = useState(null);
  const [isSaved, setIsSaved] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return {
      month: today.getUTCMonth(),
      year: today.getUTCFullYear(),
    };
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetchOrgSettingsAPI();
        setQuestionCountStatus(response.question_count);
        setSettings(response.settings);
        setIsTriviaEnabled(response.settings.isTriviaEnabled);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchScheduledQuizzesAPI(date.month, date.year);
        setQuizzes(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [date]);

  const toggleIsTriviaEnabled = async () => {
    await toggleTriviaSettingAPI(!isTriviaEnabled);
    setIsTriviaEnabled(!isTriviaEnabled);
    await fetchOrgSettingsAPI();
  };

  const handleMonthChange = (e) => {
    setDate((prevDate) => ({
      ...prevDate,
      month: Number(e.target.value),
    }));
  };

  const handleYearChange = (e) => {
    setDate((prevDate) => ({
      ...prevDate,
      year: Number(e.target.value),
    }));
    setIsSaved(false);
  };

  return (
    <div className="grid-span-1">
      <div className="rounded-lg bg-white">
        <div className="flex justify-between w-full mb-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
        </div>
        <hr></hr>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">Weekly Quiz</label>
            <button
              onClick={toggleIsTriviaEnabled}
              className={`relative w-12 h-6 flex items-center bg-gray-300 rounded-full transition-all duration-300 ${
                isTriviaEnabled ? 'bg-green-500' : ''
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                  isTriviaEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
          <hr></hr>
          <div className="flex items-center justify-between mb-4">
            <label className="font-medium text-gray-700">Select Month</label>
            <select className="p-2 rounded-md" value={date.month} onChange={handleMonthChange}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="font-medium text-gray-700">Select Year</label>
            <select className="p-2 rounded-md" value={date.year} onChange={handleYearChange}>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={new Date().getUTCFullYear() - 5 + i}>
                  {new Date().getUTCFullYear() - 5 + i}
                </option>
              ))}
            </select>
          </div>
          {quizzes && isTriviaEnabled && settings && (
            <ListManager
              settings={settings}
              isSaved={isSaved}
              setIsSaved={setIsSaved}
              selectedGenre={settings.selectedGenre}
              questionCountStatus={questionCountStatus}
              quizzes={quizzes}
              setQuizzes={setQuizzes}
              selectedMonth={date.month}
              selectedYear={date.year}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
