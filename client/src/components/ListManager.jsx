import { useState } from 'react';
import { saveGenreSettings } from '../api';

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
    console.log(selectedGenre);
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
    <div className="p-4 border rounded w-64 mx-auto">
      <h3 className="mb-2">Available Genres</h3>
      <ul>
        {availableItems.map((item) => (
          <li
            key={item.value}
            className="flex justify-between items-center mb-2 border p-2"
          >
            <span>{item.key}</span>
            <button
              onClick={() => addItem(item)}
              className="bg-green-500 text-white p-1"
            >
              ➕
            </button>
          </li>
        ))}
      </ul>
      <hr></hr>
      <h3 className="mb-2">Selected Items</h3>
      <ul>
        {selectedItems.map((item, index) => (
          <li
            key={item.value}
            className="flex justify-between items-center mb-2 border p-2"
          >
            <span>{item.key}</span>
            <div>
              {index !== 0 && (
                <button onClick={() => moveItem(index, -1)} className="mr-1">
                  ⬆️
                </button>
              )}
              {index !== selectedItems.length - 1 && (
                <button onClick={() => moveItem(index, 1)} className="mr-1">
                  ⬇️
                </button>
              )}
              <button onClick={() => removeItem(item)} className="text-red-500">
                ❌
              </button>
            </div>
          </li>
        ))}
        {!isSaved && (
          <>
            <p className="text-red-500 text-xs mt-1">
              Changes not saved. Click "Save Changes" to save your changes.
            </p>
            <button
              onClick={handleSaveChanges}
              className="p-2 bg-blue-500 text-white rounded-lg"
            >
              Save Changes
            </button>
          </>
        )}
      </ul>
    </div>
  );
}
