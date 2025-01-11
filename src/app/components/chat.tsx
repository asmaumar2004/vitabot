'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { useRef, useEffect, useState } from 'react'
import { Send, Bot, Heart, Brain, Shield, Leaf, AlertCircle, User, Menu, Star, HelpCircle } from 'lucide-react'

const suggestedChats = [
  "I have anxiety and trouble sleeping. What supplements can help?",
  "Looking for supplements to boost immune system and energy",
  "What vitamins should I take for joint pain and inflammation?",
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

export function Chat() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/ex4',
    onError: (e) => {
      console.log(e)
    }
  });

  const chatParent = useRef<HTMLDivElement>(null);

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

  const handleSuggestedChat = (suggestion: string) => {
    setInput(suggestion);
    // Trigger form submission programmatically
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col bg-gradient-to-b from-background to-background/50">
      <header className="sticky top-0 z-10 px-4 sm:px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo and title section */}
          <div className="flex items-center gap-4 transition-all-200 hover:scale-[1.02]">
            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-xl opacity-30"></div>
              <div className="relative h-12 w-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                VITABOT
              </h1>
              <p className="text-sm text-muted-foreground">
                Your personalized supplements advisor
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI Assistant Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        <div ref={chatParent} 
          className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {showWelcome ? (
              <div className="h-full flex items-center justify-center p-4">
                <div className="space-y-8 max-w-3xl w-full">
                  <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                      <Bot className="h-12 w-12 text-purple-600" />
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to VitaBot
                      </h2>
                    </div>

                    <p className="text-gray-600 text-center text-lg mb-8">
                      Your AI-powered guide to personalized supplement recommendations and wellness advice.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {features.map((feature, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl shadow-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            <feature.icon className="h-6 w-6 text-purple-500" />
                            <h3 className="font-semibold text-purple-900">{feature.title}</h3>
                          </div>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-100 p-4 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="text-sm text-purple-800">
                        <p className="font-semibold mb-1">Important Note:</p>
                        <p>While I can provide supplement suggestions, always consult with a healthcare professional before starting any new supplement regimen.</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center px-4 sm:px-0">
                    <p className="text-gray-600 mb-6">Try asking about:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                      {suggestedChats.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full h-auto min-h-[2.5rem] px-4 py-2 whitespace-normal text-sm font-medium bg-white hover:bg-purple-50 border-purple-100 hover:border-purple-200 text-purple-800 transition-colors duration-200"
                          onClick={() => handleSuggestedChat(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m, index) => (
                <div 
                  key={index} 
                  className={`group flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-2 bg-purple-100 rounded-full blur-md opacity-0 group-hover:opacity-25 transition-opacity"></div>
                      <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                        <div className="h-full w-full bg-white rounded-xl flex items-center justify-center">
                          <Bot className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className={`
                      relative px-4 py-3 rounded-2xl
                      ${m.role === 'user' 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-sm shadow-lg' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                      }
                    `}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs font-medium text-gray-400">
                        {m.role === 'user' ? 'You' : 'VitaBot'}
                      </span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-300">just now</span>
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-2 bg-purple-100 rounded-full blur-md opacity-0 group-hover:opacity-25 transition-opacity"></div>
                      <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                        <div className="h-full w-full bg-white rounded-xl flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t bg-background/50 backdrop-blur-sm p-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <Input 
                className="flex-1 rounded-xl border-2 border-input focus:border-primary focus:ring-primary bg-background/75 backdrop-blur-sm shadow-sm h-12"
                placeholder={showWelcome 
                  ? "Ask me about supplements, vitamins, or your health goals..." 
                  : "Enter your message here..."
                }
                value={input} 
                onChange={handleInputChange}
                aria-label="Chat input"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-12 w-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-lg transition-all-200 hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

