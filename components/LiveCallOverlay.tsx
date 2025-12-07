
import React, { useEffect, useState, useRef } from 'react';
import { startLiveSession, VOICE_OPTIONS } from '../services/geminiService';

interface LiveCallOverlayProps {
  onClose: () => void;
}

const LiveCallOverlay: React.FC<LiveCallOverlayProps> = ({ onClose }) => {
  const [status, setStatus] = useState('Connecting...');
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');

  useEffect(() => {
    let cleanupSession: (() => void) | undefined;

    const initSession = async () => {
      // Reset state on restart
      setError(null);
      setStatus('Connecting...');
      
      try {
        cleanupSession = await startLiveSession(
          (newStatus) => setStatus(newStatus),
          (newVolume) => setVolume(newVolume),
          selectedVoice
        );
      } catch (err) {
        console.error("Failed to init session", err);
        setError("Could not access microphone or connect to service.");
        setStatus("Connection Failed");
      }
    };

    initSession();

    return () => {
      if (cleanupSession) cleanupSession();
    };
  }, [selectedVoice]); // Re-run when voice changes

  // Visualizer circle size based on volume
  const circleSize = 100 + volume * 100; // Base 100px, expands up to 200px

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-teal-900/95 backdrop-blur-md text-white transition-opacity duration-300 animate-fade-in">
      
      {/* Header */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-teal-100">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5Z" clipRule="evenodd" />
           </svg>
           <span className="font-semibold tracking-wide hidden sm:inline">Health Guide Live</span>
        </div>

        {/* Voice Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="voice-select" className="text-xs font-medium text-teal-200/80 uppercase tracking-wider hidden sm:block">
            Voice
          </label>
          <div className="relative group">
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="appearance-none bg-teal-800/50 border border-teal-700/50 hover:border-teal-500 rounded-lg py-1.5 pl-3 pr-8 text-sm text-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer transition-colors"
              aria-label="Select Voice"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id} className="bg-teal-900 text-white">
                  {voice.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-teal-300 group-hover:text-teal-100 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        {error ? (
          <div className="text-center px-6 max-w-md">
            <div className="bg-red-500/20 text-red-100 p-4 rounded-xl border border-red-500/30 mb-4">
              <p>{error}</p>
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white text-teal-900 rounded-full font-semibold hover:bg-teal-50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Status Text */}
            <h2 className="text-2xl font-light mb-12 opacity-90 transition-all duration-500">
              {status}
            </h2>

            {/* Pulsing Circle */}
            <div className="relative flex items-center justify-center">
              <div 
                className="absolute bg-teal-400/20 rounded-full blur-xl transition-all duration-75 ease-out"
                style={{ width: circleSize * 1.5, height: circleSize * 1.5 }}
              />
              <div 
                className="absolute bg-teal-300/30 rounded-full transition-all duration-75 ease-out"
                style={{ width: circleSize * 1.2, height: circleSize * 1.2 }}
              />
              <div className="w-32 h-32 bg-teal-100 rounded-full shadow-[0_0_40px_rgba(20,184,166,0.6)] flex items-center justify-center relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-teal-600">
                    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                 </svg>
              </div>
            </div>

            <p className="mt-12 text-sm text-teal-200/60 max-w-xs text-center">
              "Tell me about your symptoms..."
            </p>
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="w-full p-8 pb-12 flex flex-col items-center gap-4">
        <p className="text-[10px] text-teal-200/50 text-center max-w-md">
          Important: Information only. Not a medical diagnosis. Consult a professional for concerns.
        </p>
        
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center w-16 h-16"
          title="End Call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.941a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.174.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.694 12.694 0 0 1 5.68-4.973l1.086-.484-4.251-1.631a.75.75 0 0 1-.432-.97Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LiveCallOverlay;
