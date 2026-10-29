import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { wellbeingApi } from '../../services/wellbeingApi';
import type { FocusTimerState } from '../../types/wellbeing';

interface FocusTimerCardProps {
  onSessionCompleted: (sessionSummary: {
    durationSeconds: number;
    pausedSeconds: number;
    effectiveSeconds: number;
  }) => void;
}

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({ onSessionCompleted }) => {
  const [timerState, setTimerState] = useState<FocusTimerState>(() => wellbeingApi.getTimerState());
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);
  const [pausedSeconds, setPausedSeconds] = useState<number>(0);

  // Recalculate accurate elapsed seconds using wall-clock epoch timestamps
  const updateTick = useCallback(() => {
    const now = Date.now();
    if (timerState.status === 'running') {
      const currentActiveDelta = timerState.lastResumeEpochMs ? (now - timerState.lastResumeEpochMs) : 0;
      const totalActiveMs = timerState.accumulatedActiveMs + currentActiveDelta;
      setDisplaySeconds(Math.floor(totalActiveMs / 1000));
      setPausedSeconds(Math.floor(timerState.accumulatedPausedMs / 1000));
    } else if (timerState.status === 'paused') {
      const currentPauseDelta = timerState.pauseStartEpochMs ? (now - timerState.pauseStartEpochMs) : 0;
      const totalPauseMs = timerState.accumulatedPausedMs + currentPauseDelta;
      setDisplaySeconds(Math.floor(timerState.accumulatedActiveMs / 1000));
      setPausedSeconds(Math.floor(totalPauseMs / 1000));
    } else {
      setDisplaySeconds(Math.floor(timerState.accumulatedActiveMs / 1000));
      setPausedSeconds(Math.floor(timerState.accumulatedPausedMs / 1000));
    }
  }, [timerState]);

  useEffect(() => {
    updateTick();
    const interval = setInterval(updateTick, 1000);
    return () => clearInterval(interval);
  }, [updateTick]);

  // Save state on change
  useEffect(() => {
    wellbeingApi.saveTimerState(timerState);
  }, [timerState]);

  const handleStart = () => {
    const now = Date.now();
    setTimerState({
      status: 'running',
      startTimeEpochMs: now,
      lastResumeEpochMs: now,
      accumulatedActiveMs: 0,
      accumulatedPausedMs: 0,
      pauseStartEpochMs: null,
    });
  };

  const handlePause = () => {
    if (timerState.status !== 'running') return;
    const now = Date.now();
    const additionalActiveMs = timerState.lastResumeEpochMs ? (now - timerState.lastResumeEpochMs) : 0;
    setTimerState({
      ...timerState,
      status: 'paused',
      lastResumeEpochMs: null,
      accumulatedActiveMs: timerState.accumulatedActiveMs + additionalActiveMs,
      pauseStartEpochMs: now,
    });
  };

  const handleResume = () => {
    if (timerState.status !== 'paused') return;
    const now = Date.now();
    const additionalPausedMs = timerState.pauseStartEpochMs ? (now - timerState.pauseStartEpochMs) : 0;
    setTimerState({
      ...timerState,
      status: 'running',
      lastResumeEpochMs: now,
      accumulatedPausedMs: timerState.accumulatedPausedMs + additionalPausedMs,
      pauseStartEpochMs: null,
    });
  };

  const handleStop = () => {
    const now = Date.now();
    let finalActiveMs = timerState.accumulatedActiveMs;
    let finalPausedMs = timerState.accumulatedPausedMs;

    if (timerState.status === 'running' && timerState.lastResumeEpochMs) {
      finalActiveMs += (now - timerState.lastResumeEpochMs);
    } else if (timerState.status === 'paused' && timerState.pauseStartEpochMs) {
      finalPausedMs += (now - timerState.pauseStartEpochMs);
    }

    const effectiveSec = Math.floor(finalActiveMs / 1000);
    const pausedSec = Math.floor(finalPausedMs / 1000);
    const totalSec = effectiveSec + pausedSec;

    onSessionCompleted({
      durationSeconds: totalSec,
      pausedSeconds: pausedSec,
      effectiveSeconds: effectiveSec,
    });

    const reset: FocusTimerState = {
      status: 'completed',
      startTimeEpochMs: null,
      lastResumeEpochMs: null,
      accumulatedActiveMs: 0,
      accumulatedPausedMs: 0,
      pauseStartEpochMs: null,
    };
    setTimerState(reset);
    wellbeingApi.clearTimerState();
  };

  const handleReset = () => {
    const reset: FocusTimerState = {
      status: 'idle',
      startTimeEpochMs: null,
      lastResumeEpochMs: null,
      accumulatedActiveMs: 0,
      accumulatedPausedMs: 0,
      pauseStartEpochMs: null,
    };
    setTimerState(reset);
    wellbeingApi.clearTimerState();
    setDisplaySeconds(0);
    setPausedSeconds(0);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Voluntary Deep-Work Focus Timer
            </h3>
            {timerState.status === 'running' && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                ACTIVE FOCUS
              </span>
            )}
            {timerState.status === 'paused' && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                PAUSED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student-controlled timer with strict mathematical pause exclusions and tab-sleep drift protection.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {timerState.status === 'idle' || timerState.status === 'completed' ? (
            <button
              type="button"
              onClick={handleStart}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Focus Session</span>
            </button>
          ) : (
            <>
              {timerState.status === 'running' ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Timer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResume}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Timer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleStop}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Save</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer Display Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 items-center">
        {/* Main Clock */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-200/80 rounded-xl p-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Effective Focus Duration (Excluding Pauses)
          </span>
          <div className="font-mono text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
            {formatTime(displaySeconds)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500 font-mono">
            <span>Total Elapsed: {formatTime(displaySeconds + pausedSeconds)}</span>
            <span>&bull;</span>
            <span className="text-amber-700 font-semibold">Excluded Pauses: {formatTime(pausedSeconds)}</span>
          </div>
        </div>

        {/* Rule Disclosure Box */}
        <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-4 text-xs text-indigo-950 space-y-2.5">
          <div className="font-semibold flex items-center gap-1.5 text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Mathematical Pause Rule</span>
          </div>
          <div className="font-mono text-[11px] bg-white p-2 rounded border border-indigo-100 text-indigo-900">
            T_effective = (T_now - T_start) - &Sigma; T_paused
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed">
            Wall-clock epoch timestamps prevent artificial inflation when switching tabs, sleeping the machine, or refreshing the browser.
          </p>
        </div>
      </div>
    </div>
  );
};
