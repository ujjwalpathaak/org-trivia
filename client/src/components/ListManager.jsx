import { useRef, useState, useCallback, useMemo } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CircleAlert, GripHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  cancelQuizAPI,
  restoreQuizAPI,
  resumeLiveQuizAPI,
  saveOrgSettings,
  suspendLiveQuizAPI,
} from '../api';

const ItemType = 'GENRE';

export default function ListManager({
  settings,
  isSaved,
  handleMonthChange,
  handleYearChange,
  setIsSaved,
  selectedGenre,
  questionCountStatus,
  quizzes,
  setQuizzes,
  date,
}) {
  const navigate = useNavigate();
  const [changedGenres, setChangedGenres] = useState([]);
  const [companyCurrentAffairsTimeline, setCompanyCurrentAffairsTimeline] = useState(
    settings.companyCurrentAffairsTimeline
  );

  const allItems = useMemo(
    () => [
      { key: 'Puzzles and Aptitude', value: 'PnA' },
      { key: 'Company Achievements', value: 'CAnIT' },
      { key: 'HR Policies', value: 'HRP' },
    ],
    []
  );

  const getInfo = useCallback(
    (value) => {
      const key = value?.toLowerCase();
      // const questions = questionCountStatus[`${key}_questions`];
      // const required_questions = questionCountStatus[`${key}_questions_required_per_quiz`];
      // console.log(questions, required_questions);
      // if (questions <= required_questions) {
      if (key === 'hrp') {
        return `No new questions available.`;
      }
      // }
      return null;
    },
    [questionCountStatus]
  );

  // Compute initial selected and available items
  const initialSelectedItems = useMemo(
    () =>
      (selectedGenre || []).map((genre) => ({
        key: allItems.find((item) => item.value === genre)?.key || '',
        value: genre,
      })),
    [selectedGenre, allItems]
  );
  const initialQuizItems = useMemo(() => {
    if (!Array.isArray(quizzes)) {
      return [];
    }

    const uniqueMap = new Map();
    quizzes.forEach((quiz) => {
      if (!uniqueMap.has(quiz.genre)) {
        const key = allItems.find((item) => item.value === quiz.genre)?.key || 'default-key';
        uniqueMap.set(quiz.genre, { key, value: quiz.genre });
      }
    });

    return Array.from(uniqueMap.values());
  }, [quizzes, allItems]);

  const [selectedItems, setSelectedItems] = useState(initialSelectedItems);

  const availableItems = useMemo(() => {
    return allItems.filter(
      (item) =>
        !selectedItems.some((i) => i.value === item.value) &&
        !settings.unavailableGenre.includes(item.value)
    );
  }, [allItems, selectedItems, settings.unavailableGenre]);

  const handleEditQuestions = useCallback(
    (quiz) => {
      navigate(`approve-questions/${quiz._id}`);
    },
    [navigate]
  );

  const handleGenreChange = useCallback(
    (e, quiz) => {
      const quizId = quiz._id;
      const status = quiz.status;
      setIsSaved(false);
      const genre = e.target.value;

      setChangedGenres((prev) => {
        const exists = prev.some((item) => item.quizId === quizId);
        if (exists) {
          return prev.map((item) => (item.quizId === quizId ? { ...item, newGenre: genre } : item));
        }
        return [...prev, { quizId, newGenre: genre }];
      });

      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((q) => (q._id === quizId ? { ...q, status, genre } : q))
      );
    },
    [setIsSaved]
  );

  const handleRestoreQuiz = async (quiz) => {
    const respones = await restoreQuizAPI(quiz._id);
    if (respones.status === 400) {
      for (const error of respones.errors) {
        toast.error(error.message);
      }
      return;
    }
    toast.success('Quiz Restored');
  };

  const handleResumeLiveQuizAPI = async (quiz) => {
    const respones = await resumeLiveQuizAPI(quiz._id);
    if (respones.status === 400) {
      for (const error of respones.errors) {
        toast.error(error.message);
      }
      return;
    }
    toast.success('Live Quiz Resumed');
  };

  const handleCancelQuiz = async (quiz) => {
    await cancelQuizAPI(quiz._id);
    toast.error('Quiz cancelled');
  };

  const handleSuspendLiveQuiz = async (quiz) => {
    await suspendLiveQuizAPI(quiz._id);
    toast.error('Quiz suspended');
  };

  const catMap = {
    PnA: 'Puzzles and Aptitude',
    CAnIT: 'Company Achievements',
    HRP: 'HR Policies',
  };

  const handleApproveEmployeeQuestions = async (quiz) => {
    navigate(`approve-questions`);
  };

  const handleSaveChanges = useCallback(async () => {
    const response = await saveOrgSettings(
      selectedItems.map((genre) => genre.value),
      changedGenres,
      companyCurrentAffairsTimeline
    );
    if (response.status === 400) {
      for (const error of response.errors) {
        toast.error(error.message);
      }
    } else {
      toast.success('New settings saved');
      setIsSaved(true);
    }
  }, [selectedItems, changedGenres, companyCurrentAffairsTimeline, setIsSaved]);

  const addItem = useCallback(
    (item) => {
      setIsSaved(false);
      setSelectedItems((prev) => [...prev, item]);
    },
    [setIsSaved]
  );

  const removeItem = useCallback(
    (item) => {
      setIsSaved(false);
      setSelectedItems((prev) => prev.filter((i) => i.value !== item.value));
    },
    [setIsSaved]
  );

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      setIsSaved(false);
      setSelectedItems((prevItems) => {
        const newItems = [...prevItems];
        const [movedItem] = newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, movedItem);
        return newItems;
      });
    },
    [setIsSaved]
  );

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
      <hr />
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700">Employee Questions</label>
        <button
          onClick={handleApproveEmployeeQuestions}
          className="bg-slate-100 hover:bg-slate-200 rounded-md p-2"
        >
          Approve
        </button>
      </div>
      <hr />
      <DndProvider backend={HTML5Backend}>
        <div className="max-w-2xl mx-auto bg-white rounded-xl">
          {settings.unavailableGenre.length !== 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Unavailable Quizzes</h3>
              <ul className="space-y-3">
                {settings.unavailableGenre.map((item) => (
                  <li
                    key={item}
                    className="cursor-not-allowed flex text-slate-500 justify-between items-center bg-gray-100 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    {catMap[item]}
                    <span className="text-red-400 text-xs px-2 py-1 rounded-md">
                      {getInfo(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {availableItems.length !== 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Available Quizzes</h3>
              <ul className="space-y-3">
                {availableItems.map((item) => (
                  <li
                    key={item.value}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex">
                      <span className="text-gray-700">{item.key}</span>
                      {getInfo(item.value) && (
                        <div className="relative group ml-2">
                          <CircleAlert width={20} className="text-xs text-red-500 cursor-pointer" />
                          <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            {getInfo(item.value)}
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

          <div>
            <h3 className="font-semibold mr-2 text-gray-800">Order of Quizzes</h3>
            <span className="text-sm italic text-gray-400">
              (Drag and drop to reorder quizzes. The updated order will apply from next month.)
            </span>
            <ul className="space-y-3 mt-4">
              {selectedItems.length === 0 && (
                <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                  No genres selected
                </li>
              )}
              <div className="flex flex-col space-y-3">
                {selectedItems.map((item, index) => (
                  <DraggableGenre
                    key={item.value}
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    removeItem={removeItem}
                    getInfo={getInfo}
                  />
                ))}
              </div>
            </ul>
          </div>
          <hr></hr>
          <div className="mt-5">
            <div className="gap-2 flex flex justify-between">
              <h3 className="font-semibold mr-2 text-gray-800">Upcoming Quizzes</h3>
              <div className="flex gap-2">
                <select className="p-2 rounded-md" value={date.month} onChange={handleMonthChange}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select className="p-2 rounded-md" value={date.year} onChange={handleYearChange}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={new Date().getUTCFullYear() - 5 + i}>
                      {new Date().getUTCFullYear() - 5 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="space-y-3 mt-4">
              {quizzes.length === 0 && (
                <li className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                  No quizzes available
                </li>
              )}
              {quizzes.length > 0 && (
                <>
                  <div className="flex">
                    <div className="w-1/4 text-slate-500 text-sm">Date</div>
                    <div className="w-3/4 text-slate-500 text-sm">Quiz</div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    {quizzes.map((quiz, index) => {
                      let bgColor = 'bg-green-100';
                      if (quiz.status === 'scheduled' || quiz.status === 'upcoming') {
                        bgColor = 'bg-slate-100';
                      } else if (quiz.status === 'suspended') {
                        bgColor = 'bg-yellow-100';
                      } else if (quiz.status === 'expired') {
                        bgColor = 'bg-slate-300';
                      } else if (quiz.status === 'cancelled') {
                        bgColor = 'bg-red-100';
                      }
                      return (
                        <div key={index} className="flex">
                          <span
                            className={`${bgColor} w-1/4 mr-2 p-2 rounded-md transition-colors`}
                          >
                            <span className="text-gray-500 text-sm">
                              {new Date(quiz.scheduledDate).toDateString()}
                            </span>
                          </span>
                          <div
                            className={`${bgColor} p-2 flex justify-between rounded-md items-center w-full relative`}
                          >
                            {quiz.status === 'upcoming' || quiz.status === 'scheduled' ? (
                              <>
                                <select
                                  value={quiz.genre || ''}
                                  className="text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onChange={(e) => handleGenreChange(e, quiz)}
                                >
                                  {allItems.map((item) => (
                                    <option
                                      key={item.value}
                                      value={item.value}
                                      className="bg-gray-100 text-black"
                                    >
                                      {item.key}
                                    </option>
                                  ))}
                                </select>
                                {/* {getInfo(quiz.genre) && (
                                  <div className="relative group">
                                    <CircleAlert
                                      width={20}
                                      className="text-xs text-red-500 cursor-pointer"
                                    />
                                    <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                      {getInfo(quiz.genre)}
                                    </span>
                                  </div>
                                )} */}
                                {quiz.status === 'scheduled' && (
                                  <div className="flex items-center">
                                    {/* <span className="text-xs italic text-green-700"></span>
                                    <button
                                      onClick={() => handleEditQuestions(quiz)}
                                      className="ml-2 text-sm text-blue-500 hover:text-blue-600 hover:scale-110 transition-all"
                                      title="Edit questions"
                                    >
                                      edit questions
                                    </button> */}
                                    <button
                                      onClick={() => handleEditQuestions(quiz)}
                                      className="text-xs m-auto hover:underline hover:text-green-500 text-green-700"
                                      title="Edit Questions"
                                    >
                                      Edit Questions
                                    </button>
                                  </div>
                                )}
                                {quiz.status !== 'scheduled' && quiz.genre === 'CAnIT' && (
                                  <div className="flex items-center">
                                    <span className="text-xs text-slate-400">
                                      {new Date(quiz.questionGenerationDate).toDateString()}
                                    </span>
                                  </div>
                                )}
                                {quiz.status !== 'cancelled' && (
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => handleCancelQuiz(quiz)}
                                      className="text-xs m-auto hover:underline hover:text-red-500 text-red-700"
                                      title="Cancel Quiz"
                                    >
                                      Cancel Quiz
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {quiz.status === 'live' ? (
                                  <div className="flex justify-between w-full">
                                    <span className="ml-2 text-sm text-green-700">
                                      {quiz.genre} is live!
                                    </span>
                                    <button
                                      onClick={() => handleSuspendLiveQuiz(quiz)}
                                      className="text-xs hover:underline hover:text-red-500 text-red-700"
                                      title="Suspend Quiz"
                                    >
                                      Suspend Quiz
                                    </button>
                                  </div>
                                ) : quiz.status === 'cancelled' ? (
                                  <>
                                    <select
                                      disabled
                                      value={quiz.genre || ''}
                                      className="text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      onChange={(e) => handleGenreChange(e, quiz)}
                                    >
                                      {allItems.map((item) => (
                                        <option
                                          key={item.value}
                                          value={item.value}
                                          className="bg-gray-100 text-black"
                                        >
                                          {item.key}
                                        </option>
                                      ))}
                                    </select>
                                    <span className="text-xs text-slate-400">Quiz Cancelled</span>
                                    <button
                                      onClick={() => handleRestoreQuiz(quiz)}
                                      className="text-xs hover:underline hover:text-green-500 text-green-700"
                                      title="Restore Quiz"
                                    >
                                      Restore Quiz
                                    </button>
                                  </>
                                ) : quiz.status === 'suspended' ? (
                                  <>
                                    <span className="text-xs text-slate-700">Quiz Suspended</span>
                                    <button
                                      onClick={() => handleResumeLiveQuizAPI(quiz)}
                                      className="text-xs hover:underline hover:text-green-500 text-green-700"
                                      title="Resume Quiz"
                                    >
                                      Resume Quiz
                                    </button>
                                  </>
                                ) : quiz.status === 'expired' ? (
                                  <span className="text-xs text-red-500">Quiz Expired</span>
                                ) : (
                                  <span className="text-xs text-yellow-600">
                                    {quiz.genre} is upcoming
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
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

function DraggableGenre({ item, index, moveItem, removeItem, getInfo }) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index, ...item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(drop(ref));

  const infoText = getInfo(item.value);

  return (
    <div
      ref={ref}
      className={`bg-slate-100 w-full rounded-lg p-2 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <GripHorizontal className="text-gray-500 mr-4 w-5 h-5 cursor-move" />
          <span className="text-gray-700">{item.key}</span>
          {infoText && !isDragging && (
            <div className="relative ml-2">
              <CircleAlert width={20} className="text-xs text-red-500 cursor-pointer" />
              <span className="absolute bottom-full w-64 mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                {infoText}
              </span>
            </div>
          )}
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
