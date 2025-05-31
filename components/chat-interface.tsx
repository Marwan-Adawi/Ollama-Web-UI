import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { RefreshCw, Send } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Model {
  name: string
}

export default function ChatInterface() {
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [promptPreset, setPromptPreset] = useState<string>("casual")
  const [systemPrompt, setSystemPrompt] = useState<string>("")
  const [userInput, setUserInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [status, setStatus] = useState<string>("Ready")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const presetPrompts = {
    casual:
      "You are a helpful, friendly AI assistant. Engage in a casual conversation, respond to questions clearly and concisely, and feel free to show some personality.",
    coding:
      "You are a helpful, friendly Coding assistant. respond to questions with clear, accurate, and efficient code solutions with explanations, Focus on best practices and help fix any issues in the code. Feel free to show some personality.",
    creative:
      "You are a creative writing assistant. Help generate imaginative content, develop ideas, and provide feedback on writing with a focus on creativity and style.",
    academic:
      "You are an academic assistant. Provide detailed, well-researched information with proper context and nuance. Focus on accuracy and educational value.",
    custom: "",
  }

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    updateSystemPrompt()
  }, [promptPreset])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadModels = async () => {
    setStatus("Loading models...")
    try {
      const response = await fetch("http://localhost:11434/api/tags")
      if (response.ok) {
        const data = await response.json()
        const modelList = data.models.map((model: Model) => model.name)
        setModels(modelList)
        setSelectedModel(modelList[0] || "deepseek-r1:1.5b")
        setStatus(`Loaded ${modelList.length} models`)
      } else {
        setStatus(`Error: ${response.status}`)
        setModels(["deepseek-r1:1.5b"])
        setSelectedModel("deepseek-r1:1.5b")
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setModels(["deepseek-r1:1.5b"])
      setSelectedModel("deepseek-r1:1.5b")
    }
  }

  const updateSystemPrompt = () => {
    if (promptPreset in presetPrompts) {
      const promptText = presetPrompts[promptPreset as keyof typeof presetPrompts]
      setSystemPrompt(promptPreset === "custom" ? "" : promptText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (!userInput.trim() || isProcessing) return

    const userMessage = userInput.trim()
    setUserInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    setIsProcessing(true)
    setStatus("Thinking...")

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel || "deepseek-r1:1.5b",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: userMessage },
          ],
          stream: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.message && data.message.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.message.content }])
        }
      } else {
        const errorText = await response.text()
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorText}` }])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ])
    } finally {
      setIsProcessing(false)
      setStatus("Ready")
    }
  }

  return (
    <div className="flex flex-col h-[80vh] gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="model-select">Model:</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]" id="model-select">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadModels} title="Refresh models">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Start a conversation with Ollama</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex gap-2">
            <Textarea
              placeholder="Type your message here..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
              disabled={isProcessing}
            />
            <Button onClick={sendMessage} disabled={!userInput.trim() || isProcessing} className="self-end">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">System Prompt Presets</h3>
                <RadioGroup
                  value={promptPreset}
                  onValueChange={setPromptPreset}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual Chat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="coding" id="coding" />
                    <Label htmlFor="coding">Coding Assistant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creative" id="creative" />
                    <Label htmlFor="creative">Creative Writing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="academic" id="academic" />
                    <Label htmlFor="academic">Academic Helper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt:</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Enter custom system prompt here..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground border-t pt-2">Status: {status}</div>
    </div>
  )
}
