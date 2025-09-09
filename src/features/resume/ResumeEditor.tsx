import React, { useState } from 'react'
import { Upload, Plus, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Resume, ResumeParseResult } from '@/types/resume'
import { ResumeZ } from '@/types/resume.zod'

export const ResumeEditor: React.FC = () => {
  const [resume, setResume] = useState<Resume>({
    basics: { fullName: '' },
    experience: [],
    education: []
  })
  const [isUploading, setIsUploading] = useState(false)
  const [confidence, setConfidence] = useState<number | null>(null)
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx'
    
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
      formData.append('type', fileType)

      const { data, error } = await supabase.functions.invoke('resume-parser', {
        body: formData
      })

      if (error) {
        throw error
      }

      const result = data as ResumeParseResult
      
      // Validate the result
      const validatedResume = ResumeZ.safeParse(result.resume)
      if (validatedResume.success) {
        setResume(validatedResume.data as Resume)
        setConfidence(result.confidence)
        toast({
          title: 'Resume parsed successfully',
          description: `Confidence: ${(result.confidence * 100).toFixed(0)}%`
        })
      } else {
        // Try to salvage what we can with proper type safety
        const parsedResult = result.resume as any
        const salvaged: Resume = {
          basics: {
            fullName: String(parsedResult?.basics?.fullName || 'Unknown'),
            title: parsedResult?.basics?.title ? String(parsedResult.basics.title) : undefined,
            email: parsedResult?.basics?.email ? String(parsedResult.basics.email) : undefined,
            phone: parsedResult?.basics?.phone ? String(parsedResult.basics.phone) : undefined,
            links: Array.isArray(parsedResult?.basics?.links) 
              ? parsedResult.basics.links
                  .filter((link: any) => link?.label && link?.url)
                  .map((link: any) => ({ label: String(link.label), url: String(link.url) }))
              : undefined,
            location: parsedResult?.basics?.location ? String(parsedResult.basics.location) : undefined
          },
          experience: Array.isArray(parsedResult?.experience) ? parsedResult.experience
            .map((exp: any) => ({
              company: String(exp?.company || ''),
              role: String(exp?.role || ''),
              start: String(exp?.start || ''),
              end: exp?.end ? String(exp.end) : undefined,
              bullets: Array.isArray(exp?.bullets) ? exp.bullets.map(String).filter((bullet: string) => bullet) : []
            }))
            .filter((exp: any) => exp.company && exp.role) : [],
          education: Array.isArray(parsedResult?.education) ? parsedResult.education
            .map((edu: any) => ({
              institution: String(edu?.institution || ''),
              degree: String(edu?.degree || ''),
              start: String(edu?.start || ''),
              end: String(edu?.end || ''),
              details: Array.isArray(edu?.details) ? edu.details.map(String) : undefined
            }))
            .filter((edu: any) => edu.institution && edu.degree) : []
        }
        setResume(salvaged)
        setConfidence(result.confidence * 0.5) // Reduce confidence for partial parse
        toast({
          title: 'Resume partially parsed',
          description: 'Some sections may need manual editing',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to parse resume',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
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
        {confidence !== null && (
          <div className="text-sm text-muted-foreground">
            Parse confidence: {(confidence * 100).toFixed(0)}%
          </div>
        )}
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