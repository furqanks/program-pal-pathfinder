import React, { useState, useRef } from 'react'
import { Upload, Plus, Trash2, FileText, Sparkles, Download, File, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Resume } from '@/types/resume'
import { ResumeZ } from '@/types/resume.zod'

export const ResumeEditor: React.FC = () => {
  const [resume, setResume] = useState<Resume>({
    basics: { 
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      links: []
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    awards: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic')
  const [confidence, setConfidence] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.docx')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to parse document')
      }

      const result = await response.json()
      
      if (result.resume) {
        const validatedResume = ResumeZ.safeParse(result.resume)
        if (validatedResume.success) {
          setResume(validatedResume.data as Resume)
          setConfidence(result.confidence)
          toast({
            title: 'Resume parsed successfully',
            description: `Confidence: ${(result.confidence * 100).toFixed(0)}%`
          })
        } else {
          // Create a valid resume with default values
          const defaultResume: Resume = {
            basics: {
              fullName: result.resume?.basics?.fullName || 'Unknown',
              title: result.resume?.basics?.title,
              email: result.resume?.basics?.email,
              phone: result.resume?.basics?.phone,
              location: result.resume?.basics?.location,
              links: result.resume?.basics?.links?.map((link: any) => ({
                label: link.label || '',
                url: link.url || ''
              })) || []
            },
            summary: result.resume?.summary,
            experience: result.resume?.experience?.map((exp: any) => ({
              company: exp.company || '',
              role: exp.role || '',
              start: exp.start || '',
              end: exp.end,
              bullets: exp.bullets || []
            })) || [],
            education: result.resume?.education?.map((edu: any) => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              start: edu.start || '',
              end: edu.end || '',
              details: edu.details
            })) || [],
            projects: result.resume?.projects?.map((proj: any) => ({
              name: proj.name || '',
              description: proj.description,
              bullets: proj.bullets,
              link: proj.link
            })),
            skills: result.resume?.skills?.map((skill: any) => ({
              category: skill.category || '',
              items: skill.items || []
            })),
            awards: result.resume?.awards?.map((award: any) => ({
              name: award.name || '',
              by: award.by,
              year: award.year
            }))
          }
          setResume(defaultResume)
          setConfidence(result.confidence * 0.5)
          toast({
            title: 'Resume partially parsed',
            description: 'Some sections may need manual editing',
            variant: 'destructive'
          })
        }
      } else {
        throw new Error('No resume data in response')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to parse resume',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImproveWithAI = async () => {
    if (!resume.basics.fullName) {
      toast({
        title: 'Resume incomplete',
        description: 'Please add at least basic information before improving',
        variant: 'destructive'
      })
      return
    }

    setIsImproving(true)

    try {
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      })

      if (!response.ok) {
        throw new Error('Failed to improve resume')
      }

      const result = await response.json()
      
      if (result.resume) {
        const validatedResume = ResumeZ.safeParse(result.resume)
        if (validatedResume.success) {
          setResume(validatedResume.data as Resume)
          toast({
            title: 'Resume improved successfully',
            description: 'AI has enhanced your resume content and structure'
          })
        } else {
          console.error('AI returned invalid resume:', validatedResume.error)
          toast({
            title: 'Improvement failed',
            description: 'AI returned invalid data. Please try again.',
            variant: 'destructive'
          })
        }
      }
    } catch (error: any) {
      console.error('Improve resume error:', error)
      let errorMessage = 'Failed to improve resume'
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Daily improvement limit reached (50/day)'
      } else if (error.message?.includes('authorization')) {
        errorMessage = 'Authentication failed'
      }
      
      toast({
        title: 'Improvement failed',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsImproving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!resume.basics.fullName) {
      toast({
        title: 'Resume incomplete',
        description: 'Please add at least basic information before exporting',
        variant: 'destructive'
      })
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume, template: selectedTemplate }),
      })

      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Resume exported successfully',
        description: 'PDF downloaded successfully'
      })
    } catch (error: any) {
      console.error('Export resume error:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export PDF. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    if (!resume.basics.fullName) {
      toast({
        title: 'Resume incomplete',
        description: 'Please add at least basic information before exporting',
        variant: 'destructive'
      })
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      })

      if (!response.ok) {
        throw new Error('Failed to export DOCX')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.docx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Resume exported successfully',
        description: 'DOCX downloaded successfully'
      })
    } catch (error: any) {
      console.error('Export resume error:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export DOCX. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        role: '',
        start: '',
        bullets: ['']
      }]
    }))
  }

  const updateExperience = (index: number, field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addBullet = (expIndex: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      )
    }))
  }

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex ? {
          ...exp,
          bullets: exp.bullets.map((bullet, j) => j === bulletIndex ? value : bullet)
        } : exp
      )
    }))
  }

  const removeExperience = (index: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        start: '',
        end: ''
      }]
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (index: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resume Editor</h1>
        <div className="flex items-center gap-4">
          {confidence !== null && (
            <div className="text-sm text-muted-foreground">
              Parse confidence: {(confidence * 100).toFixed(0)}%
            </div>
          )}
          <div className="flex items-center gap-2">
            <Label htmlFor="template-select">Template:</Label>
            <Select value={selectedTemplate} onValueChange={(value: 'classic' | 'modern') => setSelectedTemplate(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleExportPDF} 
            disabled={isExporting || !resume.basics.fullName}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </Button>
          <Button onClick={handleExportDOCX} disabled={isExporting} variant="outline">
            <File className="w-4 h-4" />
            Export DOCX
          </Button>
          <Button 
            onClick={handleImproveWithAI} 
            disabled={isImproving || !resume.basics.fullName}
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {isImproving ? 'Improving...' : 'Improve with AI'}
          </Button>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? 'Parsing...' : 'Upload PDF or DOCX'}
                </Button>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              </Label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload your resume to auto-populate sections
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={resume.basics.fullName}
                onChange={(e) => setResume(prev => ({
                  ...prev,
                  basics: { ...prev.basics, fullName: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={resume.basics.title || ''}
                onChange={(e) => setResume(prev => ({
                  ...prev,
                  basics: { ...prev.basics, title: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={resume.basics.email || ''}
                onChange={(e) => setResume(prev => ({
                  ...prev,
                  basics: { ...prev.basics, email: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={resume.basics.phone || ''}
                onChange={(e) => setResume(prev => ({
                  ...prev,
                  basics: { ...prev.basics, phone: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Experience</CardTitle>
            <Button onClick={addExperience} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume.experience.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      value={exp.start}
                      onChange={(e) => updateExperience(index, 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      value={exp.end || ''}
                      onChange={(e) => updateExperience(index, 'end', e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeExperience(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Achievements</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addBullet(index)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <Textarea
                    key={bulletIndex}
                    value={bullet}
                    onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                    className="mb-2"
                    rows={2}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Education</CardTitle>
            <Button onClick={addEducation} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Start Year</Label>
                    <Input
                      value={edu.start}
                      onChange={(e) => updateEducation(index, 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Year</Label>
                    <Input
                      value={edu.end}
                      onChange={(e) => updateEducation(index, 'end', e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeEducation(index)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}