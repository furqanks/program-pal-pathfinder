import { DocumentFeedbackInterface } from '@/features/document-assistants/DocumentFeedbackInterface'

const LORAssistant = () => {
  return (
    <DocumentFeedbackInterface 
      documentType="LOR"
      title="Letter of Recommendation Assistant"
      description="Review and improve your LOR drafts with AI-powered feedback on structure, tone, and effectiveness."
    />
  )
}

export default LORAssistant
