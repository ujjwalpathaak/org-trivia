import React, { useState } from 'react';
import { convertToReadableFormat } from '../../utils';

const BadgeViewer = ({ details, setIsBadgeViewerOpen }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const badgesPerPage = 5;

  const totalBadges = details?.badges?.length || 0;
  const totalPages = Math.ceil(totalBadges / badgesPerPage);

  const currentBadges = details?.badges?.slice(
    pageNumber * badgesPerPage,
    (pageNumber + 1) * badgesPerPage
  );

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div>
      {setIsBadgeViewerOpen && (
        <div className="col-span-5">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex w-full justify-between">
              <h2 className="text-lg font-semibold mb-4">All Badges</h2>
              <button
                onClick={() => setIsBadgeViewerOpen(false)}
                className="hover:text-red-900 bg-gray-200 hover:bg-red-300 rounded-full px-2 py-2 w-8 h-8 flex items-center justify-center"
              >
                X
              </button>
            </div>

            {totalBadges > 0 ? (
              <div className="space-y-4">
                {currentBadges?.map((badge, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-start"
                  >
                    <img
                      className="w-8"
                      src={badge.badgeDetails.url}
                      alt="Badge"
                    />
                    <div className="flex flex-col">
                      <span className="text-base text-slate-900 ml-2">
                        <span
                          className={`${badge.badgeDetails.rank === 'Gold' ? 'text-amber-700' : badge.badgeDetails.rank === 'Silver' ? 'text-zinc-400' : 'text-yellow-950'} mr-2`}
                        >
                          {badge.badgeDetails.rank}
                        </span>
                        {badge.description}
                      </span>
                      <span className="text-sm text-slate-400 ml-2">
                        Earned At{' '}
                        {badge.earnedAt &&
                          convertToReadableFormat(badge.earnedAt)}
                      </span>
                    </div>
                  </div>
                ))}
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
                    Page <span className="text-blue-600">{pageNumber + 1}</span>{' '}
                    of {totalPages}
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
            ) : (
              <p className="text-gray-500 text-sm">No badges available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeViewer;
