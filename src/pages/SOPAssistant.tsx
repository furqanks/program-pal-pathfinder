import { DocumentFeedbackInterface } from '@/features/document-assistants/DocumentFeedbackInterface'

const SOPAssistant = () => {
  return (
    <DocumentFeedbackInterface 
      documentType="SOP"
      title="Statement of Purpose Assistant"
      description="Upload or paste your SOP draft to receive detailed feedback and suggestions for improvement."
    />
  )
}

export default SOPAssistant
