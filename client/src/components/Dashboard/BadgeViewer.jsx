import React from 'react';
import { convertToReadableFormat } from '../../utils';

const BadgeViewer = ({ details, setIsBadgeViewerOpen }) => {
  return (
    <div>
      {details?.badges?.length > 0 ? (
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

            {details?.badges?.length > 0 ? (
              <div className="space-y-4">
                {details?.badges?.map((badge, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-start"
                  >
                    <img className="w-8" src={badge.badgeDetails.url} />
                    <span className="font-medium">
                      {badge.earnedAt &&
                        convertToReadableFormat(badge.earnedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No past quizzes available.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>No Badges</div>
      )}
    </div>
  );
};

export default BadgeViewer;
