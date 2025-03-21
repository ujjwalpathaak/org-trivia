import React, { useEffect, useState } from 'react';

import { getSettings, toggleTrivia } from '../api';

import { useOrgId } from '../context/auth.context';
import ListManager from '../components/ListManager';

const Settings = () => {
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [settings, setSettings] = useState(null);

  const orgId = useOrgId();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!orgId) return;
      try {
        const response = await getSettings(orgId);

        setSettings(response);
        setIsTriviaEnabled(response.isTriviaEnabled);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, [orgId]);

  const toggleIsTriviaEnabled = async () => {
    setIsTriviaEnabled(!isTriviaEnabled);
    await toggleTrivia(orgId);
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
            <label className="font-medium text-gray-700">Weekly Trivia</label>
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

          {settings && <ListManager orgId={orgId} selectedGenre={settings.selectedGenre} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
