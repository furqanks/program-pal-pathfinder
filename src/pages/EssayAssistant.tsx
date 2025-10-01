import { DocumentFeedbackInterface } from '@/features/document-assistants/DocumentFeedbackInterface'

const EssayAssistant = () => {
  return (
    <DocumentFeedbackInterface 
      documentType="Essay"
      title="Essay Assistant"
      description="Get expert feedback on your application essays. We'll help you improve clarity, storytelling, and impact."
    />
  )
}

export default EssayAssistant
