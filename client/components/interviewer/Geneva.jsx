import React from 'react';
import Speaking from '../icons/Speaking';
import { Bot } from 'lucide-react';

const Geneva = ({ isAudioPlaying, isBreakPoint }) => {
  return (
    <div className="img-container relative float-end mr-1 flex h-full w-fit justify-center rounded-md">
      <img src="/images/catherine.jpeg" alt="ai-interviewer" />
      <div className={`absolute top-1 ${isBreakPoint ? 'left-1' : ''} flex items-center gap-2 rounded-full bg-transparent p-1 ${isBreakPoint ? '' : 'pr-4'} text-sm font-semibold text-white backdrop-blur-[20px]`}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Bot size={12} />
        </span>
        {!isBreakPoint && <p>Geneva</p>}
      </div>
      <div className={`absolute bottom-2 ${isBreakPoint ? 'right-2' : 'right-5'}`}>
        <Speaking isSpeaking={isAudioPlaying} />
      </div>
    </div>
  );
};

export default Geneva;
