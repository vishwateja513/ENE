import React from 'react';
import { Trophy, TrendingUp, Users } from 'lucide-react';

interface BatchmateData {
  name: string;
  studentId: string;
  score: number;
  rank: number;
}

interface CurrentUserData {
  name: string;
  score: number;
  rank: number;
}

interface BatchFilterProps {
  currentUser: CurrentUserData;
  batchmates: BatchmateData[];
}

export const BatchFilter: React.FC<BatchFilterProps> = ({ currentUser, batchmates }) => {
  const allStudents = [
    { ...currentUser, studentId: 'You', isCurrentUser: true },
    ...batchmates.map(mate => ({ ...mate, isCurrentUser: false }))
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {/* Current User Highlight */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Your Position</p>
              <p className="text-sm text-slate-600">Rank #{currentUser.rank} in batch</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{currentUser.score.toFixed(1)}</p>
            <p className="text-sm text-slate-600">Total Score</p>
          </div>
        </div>
      </div>

      {/* Batch Leaderboard */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Top Performers in Your Batch
        </h3>
        
        {allStudents.slice(0, 5).map((student, index) => (
          <div
            key={student.studentId}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
              student.isCurrentUser
                ? 'bg-purple-50 border-2 border-purple-200'
                : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-100 text-gray-700' :
                index === 2 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                #{index + 1}
              </div>
              <div>
                <p className={`font-medium ${student.isCurrentUser ? 'text-purple-900' : 'text-slate-900'}`}>
                  {student.isCurrentUser ? 'You' : student.name}
                </p>
                {!student.isCurrentUser && (
                  <p className="text-xs text-slate-500">{student.studentId}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold ${student.isCurrentUser ? 'text-purple-600' : 'text-slate-900'}`}>
                {student.score.toFixed(1)}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="w-3 h-3" />
                <span>Rank {student.rank}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};