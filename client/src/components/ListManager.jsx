import { useState } from 'react';
import { saveGenreSettings } from '../api';
import { toast } from 'react-toastify';

export default function ListManager({ orgId, selectedGenre }) {
  const allItems = [
    {
      key: 'Puzzles and Aptitude',
      value: 'PnA',
    },
    {
      key: 'Company Achievements and Indusry Trends',
      value: 'CAnIT',
    },
    {
      key: 'Human Resource Documentation',
      value: 'HRD',
    },
  ];

  const getGenre = (value) => {
    switch (value) {
      case 'PnA':
        return 'Puzzles and Aptitude';
      case 'CAnIT':
        return 'Company Achievements and Indusry Trends';
      case 'HRD':
        return 'Human Resource Documentation';
      default:
        return '';
    }
  };

  const [selectedItems, setSelectedItems] = useState(() => {
    return selectedGenre.map((genre) => ({
      key: getGenre(genre),
      value: genre,
    }));
  });
  const [availableItems, setAvailableItems] = useState(() => {
    return allItems.filter(
      (item) => !selectedItems.some((i) => i.value === item.value),
    );
  });
  const [isSaved, setIsSaved] = useState(true);

  const handleSaveChanges = async () => {
    toast.success('New settings saved');
    const genres = selectedItems.map((genre) => genre.value);
    await saveGenreSettings(genres, orgId);
    setIsSaved(true);
  };

  const addItem = (item) => {
    setIsSaved(false);
    setSelectedItems([...selectedItems, item]);
    setAvailableItems(availableItems.filter((i) => i !== item));
  };

  const removeItem = (item) => {
    setIsSaved(false);
    setSelectedItems(selectedItems.filter((i) => i !== item));
    setAvailableItems([...availableItems, item]);
  };

  const moveItem = (index, direction) => {
    setIsSaved(false);
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedItems.length) return;
    const newItems = [...selectedItems];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    setSelectedItems(newItems);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl">
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Available Genres</h3>
        <ul className="space-y-3">
          {availableItems.length === 0 && (
            <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
              All genres selected
            </li>
          )}
          {availableItems.map((item) => (
            <li
              key={item.value}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-700">{item.key}</span>
              <button
                onClick={() => addItem(item)}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 transition-colors"
                title="Add genre"
              >
                <span className="block transform hover:scale-110 transition-transform">
                  ➕
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Selected Genres</h3>
        <ul className="space-y-3">
          {selectedItems.length === 0 && (
            <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
              No genres selected
            </li>
          )}
          {selectedItems.map((item, index) => (
            <li
              key={item.value}
              className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{item.key}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    {index !== 0 && (
                      <button
                        onClick={() => moveItem(index, -1)}
                        className="hover:scale-110 transition-transform"
                        title="Move up"
                      >
                        ⬆️
                      </button>
                    )}
                    {index !== selectedItems.length - 1 && (
                      <button
                        onClick={() => moveItem(index, 1)}
                        className="hover:scale-110 transition-transform"
                        title="Move down"
                      >
                        ⬇️
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item)}
                    className="ml-4 text-red-500 hover:text-red-600 hover:scale-110 transition-all"
                    title="Remove genre"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {!isSaved && (
          <div className="mt-6 space-y-3">
            <p className="text-red-500 text-sm">
              Changes not saved. Click "Save Changes" to save your changes.
            </p>
            <button
              onClick={handleSaveChanges}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
