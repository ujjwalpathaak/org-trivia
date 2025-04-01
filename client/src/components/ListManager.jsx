import { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CircleAlert, GripHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMonthQuizzesAPI, saveSettingsAPI } from '../api';

const ItemType = 'GENRE';

export default function ListManager({
  settings,
  isSaved,
  setIsSaved,
  selectedGenre,
  questionCountStatus,
  setSettings,
}) {
  function getInfo(value, questionCountStatus) {
    console.log(value);
    const key = value?.toLowerCase();
    const questions = questionCountStatus[`${key}_questions`];
    const required_questions = questionCountStatus[`${key}_questions_required_per_quiz`];
    if (questions <= required_questions) {
      switch (key) {
        case 'hrd':
          return `${questions} new questions available. Will start to paraphrase old questions`;

        default:
          break;
      }
    }
    return null;
  }

  const navigate = useNavigate();

  const handleEditQuestions = (quiz) => {
    navigate(`approve-questions/${quiz._id}`);
    console.log('Edit questions for quiz:', quiz);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMonthQuizzesAPI();
      console.log(response);
      setQuizzes(response);
    };

    fetchData();
  }, []);

  const allItems = [
    { key: 'Puzzles and Aptitude', value: 'PnA' },
    { key: 'Company Achievements', value: 'CAnIT' },
    { key: 'HR Policies', value: 'HRD' },
  ];

  const handleGenreChange = (e, quiz) => {
    const quizId = quiz._id;
    const status = quiz.status;
    setIsSaved(false);
    const genre = e.target.value;

    setChangedGenres((prev) => {
      const updatedGenres = prev.map((item) =>
        item.quizId === quizId ? { ...item, newGenre: genre } : item
      );

      return prev.some((item) => item.quizId === quizId)
        ? updatedGenres
        : [...prev, { quizId, newGenre: genre }];
    });

    setQuizzes((prevQuizzes) =>
      prevQuizzes.map((quiz) => (quiz._id === quizId ? { ...quiz, status, genre } : quiz))
    );
  };

  const getGenreFullName = (value) => allItems.find((item) => item.value === value)?.key || '';

  const [selectedItems, setSelectedItems] = useState(
    selectedGenre?.map((genre) => ({
      key: getGenreFullName(genre),
      value: genre,
    }))
  );

  const [availableItems, setAvailableItems] = useState(() =>
    allItems.filter((item) => !selectedItems.some((i) => i.value === item.value))
  );

  const [quizzes, setQuizzes] = useState([]);
  const [changedGenres, setChangedGenres] = useState([]);
  const [companyCurrentAffairsTimeline, setCompanyCurrentAffairsTimeline] = useState(
    settings.companyCurrentAffairsTimeline
  );

  const handleSaveChanges = async () => {
    await saveSettingsAPI(
      selectedItems.map((genre) => genre.value),
      changedGenres,
      companyCurrentAffairsTimeline
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
    <>
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700">Current Affairs timeline</label>
        <select
          className="p-2 rounded-md"
          value={companyCurrentAffairsTimeline}
          onChange={(e) => {
            setCompanyCurrentAffairsTimeline(e.target.value);
            setIsSaved(false);
          }}
        >
          <option value={1}>1 Week</option>
          <option value={2}>2 Weeks</option>
          <option value={3}>3 Weeks</option>
          <option value={4}>4 Weeks</option>
        </select>
      </div>
      <hr></hr>
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
                    <div className="flex">
                      <span className="text-gray-700">{item.key}</span>
                      {getInfo(item.value, questionCountStatus) && (
                        <div className="relative group ml-2">
                          <CircleAlert width={20} className="text-xs text-red-500 cursor-pointer" />
                          <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {getInfo(item.value, questionCountStatus)}
                          </span>
                        </div>
                      )}
                    </div>
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
        </div>
        <div className="max-w-2xl mx-auto bg-white rounded-xl">
          {settings.unavailableGenre.length !== 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Unavailable Quizzes</h3>
              <ul className="space-y-3">
                {settings?.unavailableGenre.map((item) => (
                  <li className="cursor-not-allowed flex text-slate-500 justify-between items-center bg-gray-100 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    {item}
                    <span className="text-red-400 text-xs px-2 py-1 rounded-md">
                      ! {getInfo(item, questionCountStatus)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="font-semibold mr-2 text-gray-800">Order of Quizzes</h3>
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
                      getInfo={getInfo}
                      questionCountStatus={questionCountStatus}
                    />
                  </div>
                ))}
              </div>
            </ul>
          </div>
          <div className="mt-5">
            <h3 className="font-semibold mr-2 text-gray-800">Upcoming Quizzes</h3>
            <ul className="space-y-3 mt-4">
              {selectedItems.length === 0 && (
                <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                  No genres selected
                </li>
              )}
              <div className="flex">
                <div className="w-1/4 text-slate-500 text-sm">Date</div>
                <div className="w-3/4 text-slate-500 text-sm">Quiz</div>
              </div>
              <div className="flex flex-col space-y-3">
                {quizzes.map((quiz, index) => {
                  let bgColor = 'bg-green-100';

                  switch (quiz.status) {
                    case 'live':
                      bgColor = 'bg-green-100';
                      break;
                    case 'scheduled':
                      bgColor = 'bg-slate-100';
                      break;
                    case 'upcoming':
                      bgColor = 'bg-slate-100';
                      break;
                    case 'expired':
                      bgColor = 'bg-red-100';
                      break;
                    default:
                      break;
                  }

                  return (
                    <div key={index} className="flex">
                      {/* Date Display */}
                      <span className={`${bgColor} w-1/4 mr-2 p-2 rounded-md transition-colors`}>
                        <span className="text-gray-500 text-sm">
                          {new Date(quiz.scheduledDate).toDateString()}
                        </span>
                      </span>

                      {/* Quiz Container */}
                      <div
                        className={`${bgColor} p-2 flex justify-between rounded-md items-center w-full relative`}
                      >
                        {quiz.status === 'upcoming' || quiz.status === 'scheduled' ? (
                          <>
                            {/* Genre Selection */}
                            <select
                              value={quiz.genre || ''}
                              className="text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onChange={(e) => handleGenreChange(e, quiz)}
                            >
                              {selectedItems?.map((item) => (
                                <option
                                  key={item.value}
                                  value={item.value}
                                  className="bg-gray-100 text-black"
                                >
                                  {item.key}
                                </option>
                              ))}
                            </select>

                            {getInfo(quiz.genre, questionCountStatus) && (
                              <div className="relative group">
                                <CircleAlert
                                  width={20}
                                  className="text-xs text-red-500 cursor-pointer"
                                />
                                <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                  {getInfo(quiz.genre, questionCountStatus)}
                                </span>
                              </div>
                            )}
                            {console.log(quiz)}
                            {quiz.status === 'scheduled' && (
                              <div className="flex items-center">
                                <span className="text-xs italic text-green-700">
                                  questions ready
                                </span>
                                <button
                                  onClick={() => handleEditQuestions(quiz)}
                                  className="ml-2 text-sm text-blue-500 hover:text-blue-600 hover:scale-110 transition-all"
                                  title="Edit genre"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-700">{quiz.genre}</span>
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
    </>
  );
}

function DraggableGenre({ item, index, moveItem, removeItem, getInfo, questionCountStatus }) {
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
    item: { index, ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const isInfo = getInfo(item.value, questionCountStatus);

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
          <div className="flex items-center group relative">
            {isInfo && !isDragging && (
              <div className="relative ml-2">
                <CircleAlert width={20} className="text-xs text-red-500 cursor-pointer" />
                <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  {isInfo}
                </span>
              </div>
            )}
          </div>
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
