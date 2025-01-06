'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'api/ex4',
    onError: (e) => {
      console.log(e)
    }
  })
  const chatParent = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const domNode = chatParent.current
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight
    }
  })

  return (
    <div className="w-full h-screen max-h-dvh flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
      <header className="border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <h1 className="text-3xl font-bold text-center">VITABOT</h1>
        <p className="text-center text-white/80">
          Your personalized supplements recommender
        </p>
      </header>

      <div className="flex-grow flex flex-col p-0">
        <div 
          ref={chatParent}
          className="flex-grow p-4 overflow-y-auto"
        >
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[75%] rounded-lg p-3 ${
                m.role === 'user' ? 'bg-pink-500 text-white' : 'bg-green-100 text-gray-800'
              }`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-2">
            <Input 
              className="flex-grow border-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500" 
              placeholder="Enter your allergies, symptoms, and health goals here..." 
              value={input} 
              onChange={handleInputChange}
            />
            <Button type="submit" size="icon" className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

