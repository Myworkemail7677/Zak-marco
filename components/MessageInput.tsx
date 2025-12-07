
import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
}

const AudioVisualizer: React.FC = () => (
  <div className="flex items-center gap-0.5 h-6 mr-2" aria-hidden="true">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="w-1 bg-teal-500 rounded-full"
        style={{
          animation: `sound-wave ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 0.2}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes sound-wave {
        0%, 100% { height: 4px; opacity: 0.6; }
        50% { height: 16px; opacity: 1; }
      }
    `}</style>
  </div>
);

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Describe your symptoms...");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
           setText(prev => {
             const newText = (prev + ' ' + finalTranscript).replace(/\s+/g, ' ').trim();
             return newText;
           });
           // Re-adjust height after text update
           if (textareaRef.current) {
             textareaRef.current.style.height = 'auto';
             textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
           }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionError(true);
          setTimeout(() => setPermissionError(false), 4000);
        }
      };
    }
  }, []);

  // Dynamic placeholder effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isListening) {
      let dots = 0;
      setPlaceholderText("Listening");
      interval = setInterval(() => {
        dots = (dots + 1) % 4;
        setPlaceholderText(`Listening${'.'.repeat(dots)}`);
      }, 500);
    } else {
      if (selectedImage) {
        setPlaceholderText("Ask about this medicine...");
      } else {
        setPlaceholderText("Describe your symptoms (e.g. 'I have a sharp pain in my knee')...");
      }
    }
    return () => clearInterval(interval);
  }, [isListening, selectedImage]);

  const toggleListening = () => {
    if (!isSpeechSupported || !recognitionRef.current) return;
    setPermissionError(false);

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error("Microphone toggle error:", err);
      setIsListening(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
        // Focus textarea so user can type immediately
        textareaRef.current?.focus();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || selectedImage) && !isLoading) {
      // Send image if available, pass undefined if not
      onSendMessage(text.trim(), selectedImage || undefined);
      
      setText('');
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleResearch = () => {
    if (!text.trim()) {
      setPlaceholderText("Enter a condition to research (e.g. 'Migraine')...");
      textareaRef.current?.focus();
      return;
    }
    if (!isLoading) {
      onSendMessage(`Please research and provide detailed information about: ${text.trim()}`);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-teal-100 p-4 pb-6 sm:pb-8 z-10">
      <div className="max-w-3xl mx-auto relative">
        {/* Image Preview */}
        {selectedImage && (
          <div className="absolute bottom-full mb-2 left-0 z-20 animate-fade-in-up">
            <div className="relative group inline-block">
              <img 
                src={`data:image/jpeg;base64,${selectedImage}`} 
                alt="Upload preview" 
                className="h-20 w-auto rounded-lg border-2 border-teal-200 shadow-md object-cover"
              />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`relative flex items-end gap-2 bg-white rounded-3xl shadow-sm ring-1 ring-inset transition-all p-2 ${isListening ? 'ring-teal-500 ring-2' : 'ring-slate-200 focus-within:ring-2 focus-within:ring-teal-500'}`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            rows={1}
            disabled={isLoading}
            className={`block w-full resize-none border-0 bg-transparent py-3 pl-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6 max-h-32 ${isSpeechSupported ? 'pr-40' : 'pr-28'}`}
          />
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden" 
          />

          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            {/* Visualizer when listening */}
            {isListening && <AudioVisualizer />}

            {/* Permission Error Tooltip */}
            {permissionError && (
              <div className="absolute bottom-full right-0 mb-3 w-48 bg-red-600 text-white text-[10px] font-medium rounded py-1.5 px-3 shadow-lg z-20 pointer-events-none text-center leading-tight animate-fade-in-up">
                Microphone access denied. Please check your browser permissions.
                <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-red-600"></div>
              </div>
            )}
            
            {!isListening && (
              <>
                 {/* Camera / Image Upload Button */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isLoading}
                  className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedImage 
                      ? 'bg-teal-50 text-teal-600' 
                      : 'bg-transparent text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                  }`}
                  title="Upload medicine photo"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                      <path fillRule="evenodd" d="M9.375 3.75A3 3 0 0 0 7.5 5.25h-1.5a4.5 4.5 0 0 0-4.5 4.5v7.5a4.5 4.5 0 0 0 4.5 4.5h12a4.5 4.5 0 0 0 4.5-4.5v-7.5a4.5 4.5 0 0 0-4.5-4.5h-1.5a3 3 0 0 0-1.875-1.5h-3.75Z" clipRule="evenodd" />
                   </svg>
                </button>

                <button
                  type="button"
                  onClick={handleResearch}
                  disabled={isLoading}
                  className="p-2 rounded-full flex items-center justify-center transition-all duration-300 bg-transparent text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                  title="Research a condition"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                   </svg>
                </button>
              </>
            )}

            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'bg-teal-50 text-teal-600 ring-1 ring-teal-200'
                    : 'bg-transparent text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                }`}
                title={isListening ? "Stop listening" : "Use voice input"}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
              >
                 {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                    </svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                      <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                    </svg>
                 )}
              </button>
            )}

            <button
              type="submit"
              disabled={(!text.trim() && !selectedImage) || isLoading}
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                (text.trim() || selectedImage) && !isLoading
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
              <span className="sr-only">Send</span>
            </button>
          </div>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">
            For emergencies, call your local emergency number immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;