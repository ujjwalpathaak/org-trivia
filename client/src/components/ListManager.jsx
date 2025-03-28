import { useRef, useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveGenreSettingsAPI } from '../api';
import { getMonth, getNextThreeFridays } from '../utils';

const ItemType = 'GENRE';

function getFridaysOfMonth(year = new Date().getFullYear(), month = new Date().getMonth()) {
  let fridays = [];
  let date = new Date(year, month, 1);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  while (date.getMonth() === month) {
    if (date.getDay() === 5) {
      fridays.push({
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
        isPast: date < new Date(),
      });
    }
    date.setDate(date.getDate() + 1);
  }

  return fridays;
}

export default function ListManager({ selectedGenre }) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const allItems = [
    { key: 'Puzzles and Aptitude', value: 'PnA' },
    { key: 'Company Achievements', value: 'CAnIT' },
    { key: 'HR Docs', value: 'HRD' },
  ];
  const fridays = getFridaysOfMonth();

  const nextFridayDates = getNextThreeFridays();

  const getGenreFullName = (value) => allItems.find((item) => item.value === value)?.key || '';

  const [selectedItems, setSelectedItems] = useState(
    selectedGenre.map((genre) => ({
      key: getGenreFullName(genre),
      value: genre,
    }))
  );

  const [availableItems, setAvailableItems] = useState(() =>
    allItems.filter((item) => !selectedItems.some((i) => i.value === item.value))
  );

  const [isSaved, setIsSaved] = useState(true);

  const handleSaveChanges = async () => {
    await saveGenreSettingsAPI(selectedItems.map((genre) => genre.value));
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
        {availableItems.length !== 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">Available Quizzes</h3>
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
        )}
        <div>
          <h3 className="font-semibold mr-2 text-gray-800">Selected Quizzes</h3>
          <span className="text-sm italic text-gray-400">{`(Drag and drop to reorder quizzes. The updated order will apply from next month.)`}</span>
          <ul className="space-y-3 mt-4">
            {selectedItems.length === 0 && (
              <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                No genres selected
              </li>
            )}
            <div className="flex flex-col space-y-3">
              {selectedItems.map((item, index) => (
                <div key={item.value} className="flex">
                  <DraggableGenre
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    removeItem={removeItem}
                  />
                </div>
              ))}
            </div>
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
        <div className="mt-5">
          <h3 className="font-semibold mr-2 text-gray-800">
            Upcoming Quizzes for {getMonth(currentMonth)} {currentYear}
          </h3>
          <ul className="space-y-3 mt-4">
            {selectedItems.length === 0 && (
              <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                No genres selected
              </li>
            )}
            <div className="flex">
              <div className="w-1/3 text-slate-500 text-sm">Date</div>
              <div className="w-2/3 text-slate-500 text-sm">Quiz</div>
            </div>
            <div className="flex flex-col space-y-3">
              {fridays.map((date, index) => {
                const today = new Date();
                const quizDate = new Date(
                  currentYear,
                  currentMonth,
                  parseInt(date.date.split(' ')[0])
                );
                let bgColor = 'bg-green-100';

                if (quizDate.toDateString() === today.toDateString()) {
                  bgColor = 'bg-yellow-200';
                } else if (date.isPast) {
                  bgColor = 'bg-red-100';
                }

                return (
                  <div key={index} className="flex">
                    <span className={`${bgColor} w-1/3 mr-2 p-2 rounded-md transition-colors`}>
                      <span className="text-gray-500 text-sm">{date.date}</span>
                    </span>

                    <div
                      className={`${bgColor} p-2 flex justify-between rounded-md items-center w-2/3`}
                    >
                      <div className="flex w-3/5 justify-between items-center">
                        {!date.isPast ? (
                          <select className="text-gray-700 bg-transparent">
                            {selectedItems.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.key}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-700 ">
                            {selectedGenre[index % selectedGenre.length]}
                          </span>
                        )}
                      </div>
                      {!date.isPast && (
                        <>
                          <div className="flex w-3/5 justify-end items-center">
                            <span className="text-xs italic mr-2 text-neutral-700">
                              questions ready
                            </span>
                            <button
                              onClick={() => handleEdit(item)}
                              className="ml-2 text-sm text-blue-500 hover:text-blue-600 hover:scale-110 transition-all"
                              title="Edit genre"
                            >
                              ✏️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
  const ref = useRef(null);
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
    item: { index, ...item }, // Ensure full item is passed
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-slate-100 w-full rounded-lg p-2 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex jutify-between items-center">
          <GripHorizontal className="text-gray-500 mr-4 w-5 h-5 cursor-move" />
          <span className="text-gray-700">{item.key}</span>
        </div>
        <button
          onClick={() => removeItem(item)}
          className="ml-4 text-sm text-red-500 hover:text-red-600 hover:scale-110 transition-all"
          title="Remove genre"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
