import React, { useEffect, useState } from 'react';

import { getSettingsAPI, toggleTriviaAPI } from '../api';
import ListManager from '../components/ListManager';

const Settings = () => {
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // const response = await getSettingsAPI();
        // console.log(response);
        const response = {
          isTriviaEnabled: true,
          currentGenre: 0,
          selectedGenre: ['HRD', 'PnA', 'CAnIT'],
          _id: '67e437a6fc13ed2317a414ea',
        };
        setSettings(response);
        setIsTriviaEnabled(response.isTriviaEnabled);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, []);

  const toggleIsTriviaEnabled = async () => {
    setIsTriviaEnabled(!isTriviaEnabled);
    await toggleTriviaAPI();
    await getSettingsAPI();
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

          {isTriviaEnabled && settings && <ListManager selectedGenre={settings.selectedGenre} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
