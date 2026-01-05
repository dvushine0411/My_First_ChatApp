import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";
import { useEffect } from "react";

const DirectMessageList = () => {
  const { conversations, fetchConversations } = useChatStore();

  useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);
  if (!conversations) return;

  const directConversations = conversations.filter(
    (conver) => conver.type === "direct"
  );

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((conver) => (
        <DirectMessageCard
          conver={conver}
          key={conver._id}
        />
      ))}
    </div>
  );
};

export default DirectMessageList;