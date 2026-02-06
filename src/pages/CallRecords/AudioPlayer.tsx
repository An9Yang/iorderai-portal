import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import type { CallStatus } from '../../types';

interface AudioPlayerProps {
  recordingUrl?: string;
  callStatus: CallStatus;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ recordingUrl, callStatus }) => {
  const { t } = useTranslation();
  const {
    isPlaying, currentTime, duration, isLoading, error,
    togglePlay, seek,
  } = useAudioPlayer(recordingUrl);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Missed calls: no recording
  if (callStatus === 'missed') {
    return null;
  }

  // In-progress calls: recording not yet available
  if (callStatus === 'in_progress') {
    return (
      <div className="px-6 py-3 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>{t('callRecords.recordingInProgress')}</span>
        </div>
      </div>
    );
  }

  // Completed but no recording URL
  if (!recordingUrl) {
    return (
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span>{t('callRecords.recordingUnavailable')}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 py-3 border-b border-gray-200 bg-red-50">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('callRecords.recordingError')}</span>
        </div>
      </div>
    );
  }

  // Full audio player
  return (
    <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? t('callRecords.pauseRecording') : t('callRecords.playRecording')}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Current time */}
        <span className="text-xs text-gray-500 w-10 text-right tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(currentTime)}
        </span>

        {/* Progress bar */}
        <div
          className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            seek(newTime);
          }}
        >
          <div
            className="h-full bg-blue-500 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
          </div>
        </div>

        {/* Total duration */}
        <span className="text-xs text-gray-500 w-10 tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(duration)}
        </span>

        {/* Speaker icon */}
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </div>
    </div>
  );
};

export default AudioPlayer;
