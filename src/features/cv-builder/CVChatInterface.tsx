import { useState, useRef, useEffect } from 'react'
import { Send, Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

type CVType = 'academic' | 'professional' | null

export const CVChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your CV building assistant. I'll help you create a professional CV tailored to your needs. Let's start: What type of CV would you like to create?"
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cvType, setCVType] = useState<CVType>(null)
  const [cvData, setCVData] = useState<any>({})
  const [step, setStep] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const conversationFlow = {
    academic: [
      { field: 'fullName', question: "What's your full name?" },
      { field: 'email', question: "What's your email address?" },
      { field: 'phone', question: "What's your phone number?" },
      { field: 'education', question: "Tell me about your education (institution, degree, dates):" },
      { field: 'research', question: "Describe your research experience and focus areas:" },
      { field: 'publications', question: "List your publications (if any):" },
      { field: 'conferences', question: "Have you presented at any conferences?" },
      { field: 'teaching', question: "Do you have teaching experience? If so, please describe:" },
      { field: 'skills', question: "What are your key technical and research skills?" }
    ],
    professional: [
      { field: 'fullName', question: "What's your full name?" },
      { field: 'email', question: "What's your email address?" },
      { field: 'phone', question: "What's your phone number?" },
      { field: 'title', question: "What's your professional title?" },
      { field: 'summary', question: "Give me a brief professional summary (2-3 sentences):" },
      { field: 'experience', question: "Tell me about your work experience (company, role, dates, achievements):" },
      { field: 'education', question: "What's your educational background?" },
      { field: 'skills', question: "What are your key professional skills?" },
      { field: 'achievements', question: "What are your notable achievements or awards?" }
    ]
  }

  const handleCVTypeSelection = (type: CVType) => {
    setCVType(type)
    const typeLabel = type === 'academic' ? 'Academic CV' : 'Professional CV'
    
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: typeLabel },
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! Let's build your ${typeLabel}. ${conversationFlow[type!][0].question}`
      }
    ])
    setStep(0)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !cvType) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    
    // Store the response
    const currentQuestion = conversationFlow[cvType][step]
    setCVData(prev => ({ ...prev, [currentQuestion.field]: input }))

    setInput('')
    setIsProcessing(true)

    // Move to next question or generate CV
    setTimeout(() => {
      if (step < conversationFlow[cvType].length - 1) {
        const nextStep = step + 1
        setStep(nextStep)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: conversationFlow[cvType][nextStep].question
          }
        ])
      } else {
        // All questions answered
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: "Perfect! I have all the information I need. I'm now generating your CV..."
          }
        ])
        generateCV()
      }
      setIsProcessing(false)
    }, 500)
  }

  const generateCV = async () => {
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvType, cvData })
      })

      if (!response.ok) throw new Error('Failed to generate CV')

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "✅ Your CV is ready! You can now download it in DOCX or PDF format using the buttons above."
        }
      ])

      toast({
        title: 'CV Generated',
        description: 'Your CV has been successfully created!'
      })
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate CV. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      const response = await fetch(`/api/export-cv-${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvType, cvData })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cv.${format}`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Download Complete',
        description: `CV exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export CV. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CV Builder</h1>
          <p className="text-muted-foreground">Build your CV through an interactive conversation</p>
        </div>
        {step > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleDownload('docx')}>
              <FileText className="w-4 h-4 mr-2" />
              Download DOCX
            </Button>
            <Button variant="outline" onClick={() => handleDownload('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col bg-card">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {!cvType && messages.length === 1 && (
              <div className="flex gap-4 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleCVTypeSelection('academic')}
                  className="h-24 w-48 flex flex-col gap-2"
                >
                  <FileText className="w-8 h-8" />
                  <span className="font-semibold">Academic CV</span>
                  <span className="text-xs text-muted-foreground">Research, publications, teaching</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCVTypeSelection('professional')}
                  className="h-24 w-48 flex flex-col gap-2"
                >
                  <FileText className="w-8 h-8" />
                  <span className="font-semibold">Professional CV</span>
                  <span className="text-xs text-muted-foreground">Work experience, skills</span>
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {cvType && (
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={isProcessing || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
