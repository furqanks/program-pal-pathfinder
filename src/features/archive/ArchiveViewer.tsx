import { useState, useEffect } from 'react'
import { Archive, Filter, Eye, Lock, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

type ArchiveDocument = {
  id: string
  type: 'SOP' | 'LOR' | 'Essay'
  title: string
  content: string
  university: string
  program: string
  year: number
  country: string
  degreeType: 'Undergrad' | 'MS' | 'MBA' | 'PhD'
  aiCommentary?: string
}

export const ArchiveViewer = () => {
  const [documents, setDocuments] = useState<ArchiveDocument[]>([])
  const [filteredDocs, setFilteredDocs] = useState<ArchiveDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProgram, setFilterProgram] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filterType, filterProgram, filterCountry, documents])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/archive-documents')
      if (!response.ok) throw new Error('Failed to load documents')
      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      toast({
        title: 'Load Failed',
        description: 'Failed to load archive documents',
        variant: 'destructive'
      })
    }
  }

  const applyFilters = () => {
    let filtered = [...documents]

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType)
    }

    if (filterProgram !== 'all') {
      filtered = filtered.filter(doc => doc.degreeType === filterProgram)
    }

    if (filterCountry !== 'all') {
      filtered = filtered.filter(doc => doc.country === filterCountry)
    }

    setFilteredDocs(filtered)
  }

  const handleViewDocument = (doc: ArchiveDocument) => {
    setSelectedDoc(doc)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Archive className="w-8 h-8" />
          Successful Documents Archive
        </h1>
        <p className="text-muted-foreground">
          Browse real SOPs, Essays, and LORs from successful applicants. Learn from their storytelling and structure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SOP">Statement of Purpose</SelectItem>
                  <SelectItem value="Essay">Essay</SelectItem>
                  <SelectItem value="LOR">Letter of Recommendation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Program Type</label>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="Undergrad">Undergraduate</SelectItem>
                  <SelectItem value="MS">Master's (MS)</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="outline">{doc.type}</Badge>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg mt-2">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p className="font-semibold text-foreground">{doc.university}</p>
                <p className="text-muted-foreground">{doc.program}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{doc.degreeType}</Badge>
                <Badge variant="secondary" className="text-xs">{doc.country}</Badge>
                <Badge variant="secondary" className="text-xs">{doc.year}</Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => handleViewDocument(doc)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No documents found matching your filters</p>
        </div>
      )}

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDoc?.title}</span>
              <Badge variant="outline">{selectedDoc?.type}</Badge>
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold">{selectedDoc?.university}</p>
              <p>Accepted: {selectedDoc?.year} • {selectedDoc?.degreeType} • {selectedDoc?.country}</p>
            </div>
          </DialogHeader>

          <div 
            className="flex-1 overflow-y-auto bg-muted p-6 rounded-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none' }}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {selectedDoc?.content}
            </p>
          </div>

          {selectedDoc?.aiCommentary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Why This Document Stands Out
              </h4>
              <p className="text-sm text-blue-800">{selectedDoc.aiCommentary}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
