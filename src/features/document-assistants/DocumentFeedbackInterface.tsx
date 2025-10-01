import { useState } from 'react'
import { Upload, Loader2, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

type Props = {
  documentType: 'SOP' | 'Essay' | 'LOR'
  title: string
  description: string
}

type Feedback = {
  overall: string
  strengths: string[]
  improvements: string[]
  suggestions: string[]
}

export const DocumentFeedbackInterface = ({ documentType, title, description }: Props) => {
  const [content, setContent] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setContent(text)
      toast({
        title: 'File Uploaded',
        description: 'Document content loaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to read file content',
        variant: 'destructive'
      })
    }
  }

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste or upload your document first',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType, content })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setFeedback(data.feedback)

      toast({
        title: 'Analysis Complete',
        description: 'Your document has been reviewed'
      })
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze document. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Note:</strong> This is a feedback and coaching tool. I'll provide suggestions to improve your draft, 
          but won't generate complete documents for you. The goal is to help you craft your authentic voice and story.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your {documentType} Draft</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>Upload File</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">or paste your text below</p>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your ${documentType} draft here...`}
              className="min-h-[400px] font-mono text-sm"
            />

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !content.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Feedback & Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {!feedback && !isAnalyzing && (
              <div className="text-center text-muted-foreground py-12">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload or paste your draft and click "Get Feedback" to receive detailed suggestions</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center text-muted-foreground py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                <p>Analyzing your document...</p>
              </div>
            )}

            {feedback && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Overall Assessment</h3>
                  <p className="text-sm text-muted-foreground">{feedback.overall}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-green-600">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {feedback.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Specific Suggestions</h3>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
