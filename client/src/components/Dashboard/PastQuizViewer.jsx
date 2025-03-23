import React, { useState, useEffect } from 'react';
import { ListChecks, Calendar, Trophy, TrendingUp, Coins } from 'lucide-react';
import { getPastQuizResultsAPI } from '../../api';

const PastQuizViewer = ({ setIsPastQuizViewerOpen }) => {
  const [quizCache, setQuizCache] = useState({}); // Store fetched pages
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPastQuizzes = async () => {
      if (quizCache[pageNumber]) {
        setPastQuizzes(quizCache[pageNumber]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getPastQuizResultsAPI(pageNumber, pageSize);

        if (response && response.data) {
          setPastQuizzes(response.data);
          setQuizCache((prevCache) => ({
            ...prevCache,
            [pageNumber]: response.data, // Cache fetched data
          }));
          setTotalPages(Math.max(1, Math.ceil(response.total / pageSize)));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        setError('Error fetching past quizzes');
        console.error('Error fetching past quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastQuizzes();
  }, [pageNumber]); // Keep dependencies minimal

  const handleNextPage = () => {
    setPageNumber((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setPageNumber((prevPage) => Math.max(prevPage - 1, 0));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="col-span-5">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold mb-4">Past Quizzes</h2>
          <button
            onClick={() => setIsPastQuizViewerOpen(false)}
            className="hover:text-red-900 bg-gray-200 hover:bg-red-300 rounded-full px-2 py-2 w-8 h-8 flex items-center justify-center"
          >
            X
          </button>
        </div>

        {pastQuizzes.length > 0 ? (
          <div className="space-y-4">
            {pastQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm flex justify-between"
              >
                <div>
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <ListChecks size={18} className="text-blue-500" />
                    {quiz.genre}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {quiz.createdAt ? (
                      new Date(quiz.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    ) : (
                      <>'Not available'</>
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <Coins size={20} className="text-green-500 mr-2" />
                    {quiz.points || 0} Points
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <TrendingUp size={20} className="text-blue-500 mr-2" />
                    {quiz.multiplier || 0} Multiplier
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <Trophy size={20} className="text-yellow-500 mr-2" />
                    {quiz.score || 0} Score
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No past quizzes available.</p>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              pageNumber === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>

          <span className="text-gray-700 font-semibold">
            Page <span className="text-blue-600">{pageNumber + 1}</span> of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={pageNumber === totalPages - 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              pageNumber === totalPages - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastQuizViewer;
