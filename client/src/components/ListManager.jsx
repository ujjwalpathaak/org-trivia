import { useRef, useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveGenreSettings } from '../api';

const ItemType = 'GENRE';

export default function ListManager({ orgId, selectedGenre }) {
  const allItems = [
    { key: 'Puzzles and Aptitude', value: 'PnA' },
    { key: 'Company Achievements', value: 'CAnIT' },
    { key: 'HR Docs', value: 'HRD' },
  ];

  const getGenreFullName = (value) =>
    allItems.find((item) => item.value === value)?.key || '';

  const [selectedItems, setSelectedItems] = useState(
    selectedGenre.map((genre) => ({
      key: getGenreFullName(genre),
      value: genre,
    })),
  );

  const [availableItems, setAvailableItems] = useState(() =>
    allItems.filter(
      (item) => !selectedItems.some((i) => i.value === item.value),
    ),
  );

  const [isSaved, setIsSaved] = useState(true);

  const handleSaveChanges = async () => {
    await saveGenreSettings(
      selectedItems.map((genre) => genre.value), // Preserve order
      orgId,
    );
    toast.success('New settings saved');
    setIsSaved(true);
  };

  const addItem = (item) => {
    setIsSaved(false);
    setSelectedItems([...selectedItems, item]);
    setAvailableItems(availableItems.filter((i) => i.value !== item.value));
  };

  const removeItem = (item) => {
    setIsSaved(false);
    setSelectedItems(selectedItems.filter((i) => i.value !== item.value));
    setAvailableItems([...availableItems, item]);
  };

  const moveItem = (dragIndex, hoverIndex) => {
    setIsSaved(false);
    setSelectedItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, movedItem);
      return newItems;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
                  className="text-white rounded-full p-1 transition-colors"
                  title="Add genre"
                >
                  ➕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mr-2 text-gray-800">
            Selected Genres
          </h3>
          <span className="text-sm italic text-gray-400">
            {`(Drag and Drop to Reorder)`}
          </span>
          <ul className="space-y-3 mt-4">
            {selectedItems.length === 0 && (
              <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                No genres selected
              </li>
            )}
            {selectedItems.map((item, index) => (
              <DraggableGenre
                key={item.value}
                item={item}
                index={index}
                moveItem={moveItem}
                removeItem={removeItem}
              />
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
    </DndProvider>
  );
}
function DraggableGenre({ item, index, moveItem, removeItem }) {
  const ref = useRef(null); // Use useRef instead of useState

  const [, drop] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref)); // Apply both drag and drop refs correctly

  return (
    <li
      ref={ref}
      className={`bg-blue-50 rounded-lg p-4 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex">
          <GripHorizontal className="text-gray-500 mr-2 w-5 cursor-move" />
          <span className="text-gray-700">{item.key}</span>
        </div>
        <button
          onClick={() => removeItem(item)}
          className="ml-4 text-red-500 hover:text-red-600 hover:scale-110 transition-all"
          title="Remove genre"
        >
          ❌
        </button>
      </div>
    </li>
  );
}
