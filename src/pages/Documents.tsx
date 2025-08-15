import { DocumentProvider } from "@/contexts/DocumentContext";
import SimpleDocumentInterface from "@/components/documents/SimpleDocumentInterface";
const DocumentsPage = () => {
  return (
    <DocumentProvider>
      <SimpleDocumentInterface />
    </DocumentProvider>
  );
};

export default DocumentsPage;