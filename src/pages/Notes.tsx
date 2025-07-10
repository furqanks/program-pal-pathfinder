
import NotionLikeInterface from "@/components/notes/NotionLikeInterface";
import SubscriptionGuard from "@/components/auth/SubscriptionGuard";

const Notes = () => {
  return (
    <SubscriptionGuard feature="AI-powered notes and insights">
      <NotionLikeInterface />
    </SubscriptionGuard>
  );
};

export default Notes;
