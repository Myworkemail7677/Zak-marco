
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onQuickReply: (text: string) => void;
}

interface SpecialistCardProps {
  name: string;
  expertise: string;
  conditions: string;
  onLearnMore: (name: string) => void;
}

const SpecialistCard: React.FC<SpecialistCardProps> = ({ name, expertise, conditions, onLearnMore }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const textToShare = `Specialist Recommendation: ${name}\n\nExpertise: ${expertise}\n\nCommon Conditions: ${conditions}\n\n(Consult a qualified healthcare professional for medical advice.)`;
    
    try {
      await navigator.clipboard.writeText(textToShare);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="my-4 bg-teal-50/80 border border-teal-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 relative group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-bold text-teal-900 text-lg">{name}</h3>
        </div>
        
        <button
          onClick={handleCopy}
          className={`p-2 rounded-lg transition-all duration-200 border ${
            isCopied 
              ? 'bg-teal-100 text-teal-700 border-teal-200' 
              : 'bg-white text-slate-400 border-slate-200 hover:text-teal-600 hover:border-teal-200'
          }`}
          title="Copy details"
          aria-label="Copy specialist details"
        >
          {isCopied ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide">Copied</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
              <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="space-y-3 mb-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600/80 block mb-1">Expertise</span>
          <p className="text-sm text-slate-700 leading-relaxed">{expertise}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600/80 block mb-1">Common Conditions</span>
          <p className="text-sm text-slate-700 leading-relaxed">{conditions}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-teal-200/50 flex justify-end">
        <button
          onClick={() => onLearnMore(name)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors px-2 py-1 rounded-lg hover:bg-teal-100/50"
        >
          <span>Learn more about {name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, onQuickReply }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const showQuickReplies = !isTyping && messages.length > 0 && messages[messages.length - 1].role === 'model' && !messages[messages.length - 1].isError;

  const renderMessageContent = (text: string) => {
    // Regex to match the structured specialist block
    const specialistRegex = /\*\*([^\*]+)\*\*\s*\n\*Expertise:\*\s*([\s\S]+?)\s*\n\*Common Conditions:\*\s*([\s\S]+?)(?=\n\n|\n\*\*|$)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = specialistRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      
      parts.push({
        type: 'specialist-card',
        name: match[1].trim(),
        expertise: match[2].trim(),
        conditions: match[3].trim()
      });
      
      lastIndex = specialistRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'specialist-card') {
        return (
          <SpecialistCard 
            key={`card-${idx}`}
            name={part.name}
            expertise={part.expertise}
            conditions={part.conditions}
            onLearnMore={(name) => onQuickReply(`Could you tell me more about what a ${name} does and what I might expect during a visit?`)}
          />
        );
      }

      return (
        <div key={`text-${idx}`} className="markdown-content">
          <ReactMarkdown
             components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-teal-800" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
             }}
          >
            {part.content}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100 text-center space-y-4 mx-auto max-w-lg mt-10">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-teal-900">Hello! I'm your Health Guide.</h2>
            <p className="text-slate-600">
              I can help guide you to the right medical specialist, provide health tips, or look up information about medications.
            </p>
            
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <button
                 onClick={() => onQuickReply("I'd like a general health tip to stay healthy.")}
                 className="px-4 py-2 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full hover:bg-teal-100 transition-colors border border-teal-200"
              >
                🍏 Daily Health Tip
              </button>
               <button
                 onClick={() => onQuickReply("Can you suggest a simple fitness flow or routine for better health?")}
                 className="px-4 py-2 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full hover:bg-teal-100 transition-colors border border-teal-200"
              >
                🏃‍♂️ Stay Fit Flow
              </button>
              <button
                 onClick={() => onQuickReply("I have a question about a medicine.")}
                 className="px-4 py-2 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full hover:bg-teal-100 transition-colors border border-teal-200"
              >
                💊 Medicine Info
              </button>
            </div>

            <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
              Remember: I do not provide diagnoses or prescriptions. I only suggest the type of doctor to see.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`relative max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : msg.isError 
                    ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-none'
                    : 'bg-white text-slate-800 border border-teal-100 rounded-bl-none'
              }`}
            >
              {/* Display Attachment (Image) */}
              {msg.attachment && msg.attachment.type === 'image' && (
                <div className="mb-3 -mx-2 -mt-2">
                  <img 
                    src={`data:image/jpeg;base64,${msg.attachment.content}`} 
                    alt="User uploaded" 
                    className="w-full h-auto max-h-64 object-cover rounded-lg border border-teal-700/20"
                  />
                </div>
              )}

              {msg.role === 'model' && !msg.isError ? (
                renderMessageContent(msg.text)
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                       p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                       strong: ({node, ...props}) => <strong className="font-bold text-teal-800" {...props} />,
                       ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                       li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}

              {/* Sources Section */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100/80">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      Sources
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingSources.map((source, i) => (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-700 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg transition-all shadow-sm max-w-full"
                        >
                          <span className="truncate max-w-[150px]">{source.title || new URL(source.uri).hostname}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-50">
                            <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-teal-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-1.5 h-10">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {showQuickReplies && (
          <div className="flex flex-col items-end space-y-2 mt-2 animate-fade-in-up sm:pr-[12%]">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">Suggested actions</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => onQuickReply("I'd like to explore other options. Is there a different type of specialist I could see?")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100 hover:bg-teal-100 hover:border-teal-200 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                </svg>
                Suggest another option
              </button>
              <button
                onClick={() => onQuickReply("Why do you suggest this specialist?")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-600 text-xs font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.945a.75.75 0 0 1-1.5 0v-1a1.5 1.5 0 0 0-1.407-1.41l-.765-.172a1.5 1.5 0 0 1-1.06-1.448c0-.692.433-1.285 1.06-1.449l.764-.173a1.5 1.5 0 0 0 1.138-1.256Z" clipRule="evenodd" />
                    <path d="M10 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                </svg>
                Why this specialist?
              </button>
               <button
                onClick={() => onQuickReply("Give me a wellness tip for staying disease-free.")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-teal-600 text-xs font-medium border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-colors shadow-sm"
              >
                🍏 Wellness Tip
              </button>
              <button
                onClick={() => onQuickReply("Can you give me detailed information about a specific medication?")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-teal-600 text-xs font-medium border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-colors shadow-sm"
              >
                💊 Medicine Info
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-right max-w-md mt-2 italic">
              Important: This is for informational purposes only. It is not a medical diagnosis. Please consult a qualified healthcare professional for any health concerns.
            </p>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;