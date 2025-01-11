'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { useRef, useEffect, useState } from 'react'
import { Send, Bot, Brain, Shield, Leaf, AlertCircle, User, Mic, MicOff } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// Define interfaces for TypeScript
interface SuggestionButtonProps {
  icon: string;
  text: string;
  onClick: () => void;
}

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Add SpeechRecognitionEvent type
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

const suggestedChats = [
  {
    icon: "💤",
    text: "I have anxiety and trouble sleeping. What supplements can help?"
  },
  {
    icon: "⚡",
    text: "Looking for supplements to boost immune system and energy"
  },
  {
    icon: "🦴",
    text: "What vitamins should I take for joint pain and inflammation?"
  }
];

const features = [
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Get personalized supplement suggestions based on your unique health profile"
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Receive information about potential interactions and safety considerations"
  },
  {
    icon: Leaf,
    title: "Natural Solutions",
    description: "Learn about natural and holistic approaches to your health goals"
  }
];

const SuggestionButton = ({ icon, text, onClick }: SuggestionButtonProps) => (
  <button
    onClick={onClick}
    className="group flex items-start gap-3 p-4 w-full text-left transition-all duration-200 
               bg-white hover:bg-gray-50 border border-gray-200 rounded-xl
               hover:border-purple-200 hover:shadow-sm"
  >
    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-purple-100 
                     rounded-lg text-lg group-hover:scale-110 transition-transform duration-200">
      {icon}
    </span>
    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
      {text}
    </span>
  </button>
);

export function Chat() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, setInput, append, isLoading: aiLoading } = useChat({
    api: '/api/ex4',
    onError: (e) => {
      console.log(e)
      setIsLoading(false);
    },
    onFinish: () => {
      setIsLoading(false);
    }
  });

  const chatParent = useRef<HTMLDivElement>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    const domNode = chatParent.current
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight
    }
  });

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  // Add cleanup for recording timer
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  // Updated chat initiation function
  const initiateChat = async (text: string) => {
    setIsLoading(true);
    setShowWelcome(false);
    
    try {
      await append({
        content: text,
        role: 'user',
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setInput('');
      setIsLoading(false);
    }
  };

  const handleSuggestedChat = (suggestion: string) => {
    initiateChat(suggestion);
  };

  // Initialize speech recognition
  const startListening = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      setRecordingTime(0);
      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    };
    
    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      // Clear timer
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      // Add timeout before processing
      setTimeout(async () => {
        await initiateChat(transcript);
      }, 500);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
    
    recognition.start();
  };

  return (
    <div className="relative flex flex-col h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  VITABOT
                </h1>
                <p className="text-xs text-gray-500">Your supplements advisor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <div ref={chatParent} 
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        >
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {showWelcome ? (
              <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-full max-w-3xl space-y-8 p-4">
                  {/* Welcome Card */}
                  <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        Welcome to VitaBot
                      </h2>
                      <p className="text-gray-600 max-w-lg">
                        Your AI-powered guide to personalized supplement recommendations and wellness advice.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 mb-8">
                      {features.map((feature, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <feature.icon className="h-5 w-5 text-purple-600" />
                            <h3 className="font-medium text-gray-900">{feature.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-900">
                        <p className="font-medium mb-1">Important Note:</p>
                        <p>While I can provide supplement suggestions, always consult with a healthcare professional before starting any new supplement regimen.</p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Queries */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started</h3>
                      <p className="text-sm text-gray-600">Choose a topic or type your own question</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 lg:grid-cols-3">
                      {suggestedChats.map((suggestion, index) => (
                        <SuggestionButton
                          key={index}
                          icon={suggestion.icon}
                          text={suggestion.text}
                          onClick={() => handleSuggestedChat(suggestion.text)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m, index) => (
                  <div 
                    key={index} 
                    className={`group flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'user' && (
                      <div className="relative flex-shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                      <div className={`
                        px-4 py-2.5 rounded-2xl prose prose-sm max-w-none
                        ${m.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-sm prose-invert' 
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm prose-purple'
                        }
                      `}>
                        <ReactMarkdown className="text-sm leading-relaxed">
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs font-medium text-gray-500">
                          {m.role === 'user' ? 'You' : 'VitaBot'}
                        </span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-xs text-gray-400">just now</span>
                      </div>
                    </div>

                    {m.role === 'user' && (
                      <div className="relative flex-shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area with Audio Button */}
        <div className="border-t bg-white p-4">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <Input 
                className="flex-1 h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                placeholder={isLoading || aiLoading
                  ? "Processing..."
                  : showWelcome 
                    ? "Ask me about supplements, vitamins, or your health goals..." 
                    : "Type your message here..."
                }
                value={input} 
                onChange={handleInputChange}
                aria-label="Chat input"
                disabled={isLoading || aiLoading}
              />
              
              {speechSupported && (
                <div className="relative">
                  <Button
                    type="button"
                    size="icon"
                    onClick={startListening}
                    disabled={isListening || isLoading || aiLoading}
                    className={`h-11 w-11 ${
                      isListening 
                        ? 'bg-pink-600' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    } hover:opacity-90 text-white rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100`}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  {isListening && (
                    <>
                      <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 animate-pulse" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-500">
                        Recording {recordingTime}s
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || aiLoading}
                className="h-11 w-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className={`h-4 w-4 ${(isLoading || aiLoading) ? 'animate-pulse' : ''}`} />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

