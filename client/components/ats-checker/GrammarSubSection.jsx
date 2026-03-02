import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Edit3, RefreshCw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GrammarSubSection = ({ 
  categoryTitle, 
  issues, 
  isOpen, 
  onToggle,
  categoryIcon,
  categoryDescription 
}) => {
  const [copiedIds, setCopiedIds] = useState(new Set());
  
  if (!issues || issues.length === 0) return null;

  const getCategoryIcon = () => {
    switch(categoryTitle.toLowerCase()) {
      case 'active_voice':
        return <Edit3 className="w-5 h-5 " />;
      case 'tense_consistency':
        return <RefreshCw className="w-5 h-5 " />;
      case 'repetitive_words':
        return <Copy className="w-5 h-5 " />;
      case 'sentence_clarity':
        return <CheckCircle className="w-5 h-5 " />;
      case 'first_person_pronouns':
        return <AlertTriangle className="w-5 h-5 " />;
      default:
        return categoryIcon || <Edit3 className="w-5 h-5 " />;
    }
  };

  const formatCategoryTitle = (title) => {
    return title.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds(prev => new Set([...prev, id]));
      setTimeout(() => {
        setCopiedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderRepetitiveWordsGrid = (issues) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => {
          const word = issue.solution[0]; // First word is the repeated word
          const suggestions = issue.solution.slice(1); // Rest are suggestions
          const count = issue.issue.match(/(\d+)/)?.[1] || 'multiple';
          
          return (
            <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-3">
                <h5 className="font-medium text-red-600">{word}</h5>
                <p className="text-xs text-gray-500">used {count} times</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-start">
                {suggestions.map((suggestion, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => copyToClipboard(suggestion, `${issue.id}-${index}`)}
                    title="Click to copy"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSentenceClarity = (issues) => {
    return (
      <div className="space-y-6">
        {issues.map((issue) => (
          <div key={issue.id} className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Original:</p>
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded border-l-4 border-red-400">
                {issue.issue}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2">Improved version:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  {Array.isArray(issue.solution) ? (
                    issue.solution.map((sentence, index) => (
                      <li key={index}>{sentence}</li>
                    ))
                  ) : (
                    <li>{issue.solution}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRegularIssues = (issues) => {
    return (
      <div className="space-y-4">
        {issues.map((issue,inx) => (
          <div key={issue.id} className={`space-y-3 p-4 bg-gray-50 rounded-xl`}>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Original:</p>
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded border-l-4 border-red-400">
                {issue.issue}
              </p>
            </div>
            
            {issue.solution && typeof issue.solution === 'string' && (
              <div className="relative">
                <p className="text-xs text-gray-500 font-medium mb-1">Solution:</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-green-700 flex-1">{issue.solution}</p>
                    <button
                      onClick={() => copyToClipboard(issue.solution, issue.id)}
                      className="flex-shrink-0 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                      title="Copy solution"
                    >
                      {copiedIds.has(issue.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3 text-secondary">
          {getCategoryIcon()}
          <div>
            <h4 className="text-lg font-medium ">
              {formatCategoryTitle(categoryTitle)}
            </h4>
            <p className="text-sm text-gray-500">
              {issues.length} issue{issues.length > 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Content with animation */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 space-y-4">
              {categoryDescription && (
                <p className="text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">
                  {categoryDescription}
                </p>
              )}
              
              {/* Render different layouts based on category */}
              {categoryTitle === 'repetitive_words' && renderRepetitiveWordsGrid(issues)}
              {categoryTitle === 'sentence_clarity' && renderSentenceClarity(issues)}
              {categoryTitle !== 'repetitive_words' && categoryTitle !== 'sentence_clarity' && renderRegularIssues(issues)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
