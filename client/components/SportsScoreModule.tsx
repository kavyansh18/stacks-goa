'use client';

import { useState, useEffect } from 'react';
import { SportsMatch } from '@/types';
import { APIService } from '@/lib/api';
import { Trophy, Clock, Play, CheckCircle, RefreshCw } from 'lucide-react';

export default function SportsScoreModule() {
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('football');
  const [selectedLeague, setSelectedLeague] = useState('NFL');

  const apiService = APIService.getInstance();

  useEffect(() => {
    fetchMatches();
  }, [selectedSport, selectedLeague]);

  useEffect(() => {
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [selectedSport, selectedLeague]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const sportsMatches = await apiService.getSportsScores(selectedSport, selectedLeague);
      setMatches(sportsMatches);
    } catch (error) {
      console.error('Failed to fetch sports scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'live': return <Play className="w-4 h-4 text-red-500 blinking" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatScore = (match: SportsMatch) => {
    if (match.status === 'scheduled') {
      return new Date(match.startTime).toLocaleString();
    }
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      return `${match.homeScore} - ${match.awayScore}`;
    }
    return 'TBD';
  };

  return (
    <div className="terminal-box p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 terminal-glow" />
          <h3 className="text-xl font-bold terminal-glow">SPORTS SCORES</h3>
        </div>
        
        <button
          onClick={fetchMatches}
          disabled={isLoading}
          className="retro-button text-xs px-2 py-1 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Sport/League Selector */}
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="retro-select"
        >
          <option value="football">FOOTBALL</option>
          <option value="basketball">BASKETBALL</option>
          <option value="baseball">BASEBALL</option>
          <option value="hockey">HOCKEY</option>
        </select>

        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="retro-select"
        >
          {selectedSport === 'football' && (
            <>
              <option value="NFL">NFL</option>
              <option value="College">COLLEGE</option>
            </>
          )}
          {selectedSport === 'basketball' && (
            <>
              <option value="NBA">NBA</option>
              <option value="NCAA">NCAA</option>
            </>
          )}
          {selectedSport === 'baseball' && (
            <>
              <option value="MLB">MLB</option>
              <option value="MiLB">MILB</option>
            </>
          )}
          {selectedSport === 'hockey' && (
            <>
              <option value="NHL">NHL</option>
              <option value="NCAA">NCAA</option>
            </>
          )}
        </select>
      </div>

      {/* Matches */}
      <div className="space-y-4 mb-6">
        {matches.map((match) => (
          <div key={match.id} className="terminal-box p-4 scan-line">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(match.status)}
                <span className="text-sm uppercase font-bold">{match.status}</span>
              </div>
              <span className="text-xs text-gray-400">{match.league}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-right">
                <div className="font-bold">{match.awayTeam}</div>
                {match.awayScore !== undefined && (
                  <div className="text-2xl font-bold terminal-glow">{match.awayScore}</div>
                )}
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">VS</div>
                <div className="text-sm text-gray-400">
                  {match.status === 'scheduled' 
                    ? new Date(match.startTime).toLocaleTimeString()
                    : formatScore(match)
                  }
                </div>
              </div>

              <div className="text-left">
                <div className="font-bold">{match.homeTeam}</div>
                {match.homeScore !== undefined && (
                  <div className="text-2xl font-bold terminal-glow">{match.homeScore}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-green-500 p-4">
        <h4 className="text-lg font-bold mb-3 terminal-glow">RECENT SCORE REQUESTS</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-600">
            <span>Chiefs vs Bills Final Score</span>
            <span className="text-green-500">RESOLVED</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-600">
            <span>Lakers vs Celtics Live Score</span>
            <span className="text-red-500">DISPUTED</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Cowboys vs Giants Final Score</span>
            <span className="text-yellow-500">PENDING</span>
          </div>
        </div>
      </div>
    </div>
  );
}