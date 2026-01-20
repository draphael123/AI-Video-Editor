"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isProcessing,
  suggestions = [],
  placeholder = "Describe what you want to do...",
  className,
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isProcessing) {
        onSubmit();
      }
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className={cn(
            "w-5 h-5 transition-colors",
            isProcessing ? "text-spark-400 animate-pulse" : "text-spark-400"
          )} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          disabled={isProcessing}
          className={cn(
            "w-full bg-void-800/80 border border-void-700/50 rounded-2xl",
            "pl-12 pr-28 py-4 text-zinc-100 placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-spark-500/50 focus:border-spark-500/50",
            "transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          )}
        />

        {/* Clear & Submit buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !isProcessing && (
            <button
              onClick={() => onChange("")}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <span className="text-xs text-zinc-600 mr-2 hidden sm:inline">
            Press Enter ↵
          </span>

          <button
            onClick={onSubmit}
            disabled={!value.trim() || isProcessing}
            className={cn(
              "py-2 px-4 rounded-xl font-medium transition-all duration-200",
              "bg-gradient-to-r from-spark-500 to-spark-400 text-void-950",
              "hover:from-spark-400 hover:to-spark-300",
              "shadow-lg shadow-spark-500/25 hover:shadow-spark-400/40",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-spark-500/25"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-void-900/95 backdrop-blur-xl border border-void-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
              {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:text-zinc-100 hover:bg-void-800/80 transition-colors border-b border-void-800 last:border-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

