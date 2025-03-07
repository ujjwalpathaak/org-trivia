import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Share2,
  Image,
  Zap,
  MessageSquare,
  Award,
  Bookmark as BookmarkSimple,
} from 'lucide-react';

import leaderboard from '../../assets/leaderboard.png';

import Settings from '../../pages/Settings';
import QuestionMaker from '../../pages/QuestionMaker';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isQuestionMakerOpen, setIsQuestionMakerOpen] = useState(false);

  return (
    <div className="min-h-[93vh] flex justify-center bg-[#f0f2f5]">
      {/* Main Content */}
      <div className="pt-4 px-4 grid grid-cols-11 gap-4">
        {/* Left Sidebar */}
        <div className="col-span-2 col-start-2">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex flex-col items-center">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Colleague"
                className="w-20 h-20 rounded-full mb-4"
              />
              <div className="flex justify-between w-full mb-6">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>0</span>
                  </div>
                  <span className="text-sm text-gray-500">Appreciations</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>0</span>
                  </div>
                  <span className="text-sm text-gray-500">Awards</span>
                </div>
              </div>
              <nav className="w-full space-y-4">
                <button className="w-full text-left px-4 rounded hover:bg-gray-100 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  My Activity
                </button>
                <button className="w-full text-left px-4 rounded hover:bg-gray-100 flex items-center gap-2">
                  <BookmarkSimple className="h-4 w-4" />
                  Saved Posts
                </button>
              </nav>
            </div>
          </div>

          {/* Groups Section */}
          <div className="bg-white mb-4 rounded-lg p-4 mt-4 shadow">
            <div className="rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Submit Question</h2>
              {!isQuestionMakerOpen && (
                <button
                  onClick={() => setIsQuestionMakerOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Write Question
                </button>
              )}
            </div>
          </div>
          <div className="bg-white w-fit h-fit p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Approve Questions</h2>
            <p className="text-gray-600">
              Review and approve pending questions.
            </p>
            <button
              onClick={() => navigate('approve-questions')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Pending Questions
            </button>
          </div>
        </div>

        {isQuestionMakerOpen ? (
          <QuestionMaker setIsQuestionMakerOpen={setIsQuestionMakerOpen} />
        ) : (
          <div className="col-span-5">
            <div className="bg-white rounded-lg p-6 shadow mb-4">
              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Colleague"
                  className="w-10 h-10 rounded-full"
                />
                <input
                  type="text"
                  placeholder="Share new learnings!"
                  className="w-full bg-gray-100 rounded-lg px-4"
                />
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  Share-worthy Vibes
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Express in pictures! From latest reads to travels
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Ignite Learning Sparks! Discuss to expand...
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Share ideas! Get feedback and grow.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500 text-white rounded-lg p-6 shadow mb-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    AI
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    RA
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    +1
                  </div>
                </div>
                <p className="flex-1">
                  4 people in your organization are celebrating their Birthdays
                  today!
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="col-span-2">
          <div className="bg-white rounded-lg p-6 shadow mb-4">
            <Settings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
