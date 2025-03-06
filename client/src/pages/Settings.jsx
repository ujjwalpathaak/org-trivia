import React, { useEffect, useState } from 'react';
import { useOrgId } from '../context/auth.context';
import { getSettings, toggleTrivia } from '../api';
import ListManager from '../components/ListManager';

const Settings = () => {
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState([]);
  const [currentGenre, setCurrentGenre] = useState(0);
  const [settings, setSettings] = useState(null);

  const orgId = useOrgId();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!orgId) return;
      try {
        const response = await getSettings(orgId);
        console.log('Fetched Settings:', response);

        setSettings(response);
        setIsTriviaEnabled(response.isTriviaEnabled);
        setCurrentGenre(response.currentGenre);
        setSelectedGenre(response.selectedGenre);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, [orgId]);

  const toggleIsTriviaEnabled = async () => {
    await toggleTrivia(orgId);
  };

  return (
    <div className=" flex items-center justify-center bg-gray-100">
      <div className="mt-[6rem] w-1/2 floating-div p-6 shadow-lg rounded-lg bg-white">
        <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
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
          <h3 className="mb-2">Genres</h3>
          {settings && (
            <ListManager orgId={orgId} selectedGenre={settings.selectedGenre} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
