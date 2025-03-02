import React, { useEffect, useState } from 'react';
import { useOrgId } from '../context/auth.context';
import { getSettings, toggleTrivia } from '../api';

const Settings = () => {
  const [isTriviaEnabled, setIsTriviaEnabled] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(['loading']);
  const [currentGenre, setCurrentGenre] = useState(0);

  const orgId = useOrgId();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!orgId) return;

      try {
        const response = await getSettings(orgId);

        setIsTriviaEnabled(response.isTriviaEnabled);
        setCurrentGenre(response.currentGenre);
        setSelectedGenre(response.selectedGenre);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, [orgId]);

  const toggleIsTriviaEnabled = () => {
    setIsTriviaEnabled(!isTriviaEnabled);
    toggleTrivia(orgId);
  };

  return (
    <div className="parent-page-div flex items-center justify-center bg-gray-100">
      <div className="mt-[6rem] max-w-2xl floating-div p-6 shadow-lg rounded-lg bg-white">
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
          {/* <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Genres
            </h3>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="p-2 border rounded-lg w-full"
                placeholder="Add a genre"
              />
              <button
                onClick={addGenre}
                className="p-2 bg-blue-500 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {genres.map((genre, index) => (
                <li
                  key={index}
                  className="flex justify-between p-2 bg-gray-200 rounded-lg"
                >
                  {genre}
                  <button
                    onClick={() => removeGenre(index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
