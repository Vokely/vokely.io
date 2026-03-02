import { useState, useRef, useEffect } from 'react';
import { User, Bot, Send } from 'lucide-react';

const ChatInterface = ({isGenerating, processingRef, history, setUserResponse, handleSendResponse, userResponse, animatedHistory, setAnimatedHistory, lastProcessedIndexRef, isUserTurn, closeSuggestions, closeChatInterface, isBreakPoint}) => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [loadingDots, setLoadingDots] = useState('');
  
  // Loading dots animation
  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isGenerating]);
  
  useEffect(() => {
    if (!history?.length) return;
    
    // If breakPoint is true, just use history directly without animation
    // if (isBreakPoint) {
      const formattedHistory = history.map(item => ({
        ...item,
        animatedText: item.content
      }));
      setAnimatedHistory(formattedHistory);
      lastProcessedIndexRef.current = history.length - 1;
      processingRef.current = false;
      return;
    // }
    
    if (processingRef.current) {
      setAnimatedHistory(prevHistory => {
        // Find the last AI message in the history
        const lastAIMessageIndex = lastProcessedIndexRef.current === -1 ? 0 : lastProcessedIndexRef.current;
        if (lastAIMessageIndex !== -1) {
            const originalMessage = history[lastAIMessageIndex];
            // If the animated text is not complete, update it to the full message
            const updatedHistory = [...prevHistory];
            updatedHistory[lastAIMessageIndex] = {
                message: originalMessage.message,
                animatedText: originalMessage.message,
                role: originalMessage.role
            };
            processingRef.current = false;
            return updatedHistory;
        }
        processingRef.current = false;
        return prevHistory;
      });
      processingRef.current = false;
    };
    
    // Special handling for the first message when no messages have been processed yet
    const nextMessageIndex = lastProcessedIndexRef.current === -1 
      ? 0 
      : history.findIndex((_, index) => index > lastProcessedIndexRef.current);
    
    if (nextMessageIndex === -1) return;
    
    const nextMessage = history[nextMessageIndex];
    const messageContent = nextMessage.message || ''; // Ensure we always have a string
    
    // Additional check to prevent processing empty messages
    if (!messageContent.trim()) {
      lastProcessedIndexRef.current = nextMessageIndex;
      return;
    }
    
    // Ensure we do not append the same message twice
    if (animatedHistory.some(msg => msg.message === messageContent)) {
      return;
    }
    
    const existingMessageIndex = animatedHistory.findIndex(
      msg => msg.role === nextMessage.role && msg.message === messageContent
    );
    
    if (existingMessageIndex !== -1) return;
    
    // If the message is from the user, instantly add it
    if (nextMessage.role === 'User') {
      setAnimatedHistory((prev) => [...prev, { 
        ...nextMessage, 
        message: messageContent,
        animatedText: messageContent 
      }]);
      lastProcessedIndexRef.current = nextMessageIndex;
      return;
    }

    // If the message is from the AI, animate it
    processingRef.current = true;
    setAnimatedHistory((prev) => [...prev, { 
      ...nextMessage, 
      message: messageContent,
      animatedText: '' 
    }]);

    let index = 0;
    const interval = setInterval(() => {
      setAnimatedHistory((prev) => {
        const updatedMessages = [...prev];
        const lastMsgIndex = updatedMessages.length - 1;
        
        if (index < messageContent.length) {
          updatedMessages[lastMsgIndex].animatedText += messageContent[index];
          index++;
        } else {
          clearInterval(interval);
          processingRef.current = false;
          lastProcessedIndexRef.current = nextMessageIndex;
        }
        return updatedMessages;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      processingRef.current = false;
    };
  }, [history, isBreakPoint]);

  useEffect(() => {
    scrollToBottom();
  }, [animatedHistory, loadingDots, isGenerating]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => setUserResponse(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitResponse();
    }
  };
  
  const submitResponse = () => {
    if (!userResponse.trim()) return;
    if (!isUserTurn || processingRef.current) return; 
    closeSuggestions();
    setUserResponse("");
    closeChatInterface();
    handleSendResponse();
    inputRef.current?.focus();
  };

  // Determine which message array to use
  const messagesToDisplay = animatedHistory;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F3FF]">
        {messagesToDisplay.length === 0 && !isGenerating ? (
          <div className="p-4 text-center text-gray-500">No messages yet</div>
        ) : (
          <>
            {messagesToDisplay.map((message, index) => (
              message.animatedText && (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'border-[1px] border-blue-600 text-blue-600' : 'border-[1px] border-primary text-primary'}`}>
                        {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                    </div>
                    {/* Message with animated reveal */}
                    <div className={`py-2 px-4 rounded-lg ${message.role === 'user' ? 'bg-blue-500 font-medium text-white rounded-tr-none' : 'bg-[#E6D6FF] font-medium border border-gray-200 text-primary rounded-tl-none shadow-sm'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.animatedText}</p>
                    </div>
                  </div>
                </div>
              )
            ))}
            
            {/* Loading indicator */}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] flex-row">
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center border-[1px] border-primary text-primary">
                      <Bot size={16} />
                    </div>
                  </div>
                  {/* Typing indicator */}
                  <div className="py-2 px-4 rounded-lg bg-[#E6D6FF] font-medium border border-gray-200 text-primary rounded-tl-none shadow-sm">
                    <p className="text-sm whitespace-pre-wrap">Thinking{loadingDots}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="flex-grow relative">
            <textarea
              ref={inputRef}
              value={userResponse}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows="3"
              style={{ maxHeight: `${isBreakPoint ? '50px':'150px'}`, minHeight: '30px' }}
            />
          </div>
          <button 
            onClick={submitResponse} 
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full p-3 flex items-center justify-center transition-colors" 
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;