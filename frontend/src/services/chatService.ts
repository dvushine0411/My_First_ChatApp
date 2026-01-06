import api from '@/lib/axios';
import type { ConversationResponse, Message } from '@/types/chat';


interface FetchMessagesProps {
    messages: Message[],
    cursor?: string
}

const limitPage = 50;

// Gọi API và trả về kết quả trong API // 
export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessages(id: string, cursor?: string) : Promise<FetchMessagesProps> {
    const res = await api.get(`/conversations/${id}/messages?limit=${limitPage}&cursor=${cursor}`);

    return {messages: res.data.messages, cursor: res.data.nextCursor};
  }, 

  async sendDirectMessages(recipientId: string, content: string, image?: string | File, conversationId?: string) {
    const formData = new FormData();
    formData.append("recipientId", recipientId);
    formData.append("content", content);
    if(conversationId)
    {
      formData.append("conversationId", conversationId);
    }
    // Phần Xử lý ảnh //

    if(image instanceof File)
    {
      formData.append("image", image);
    }
    else if(typeof image === "string")
    {
      formData.append("imgUrl", image);
    }
    const res = await api.post("/messages/direct", formData);

    return res.data.message
  },

  async sendGroupMessages(conversationId: string, content: string, image?: string | File) {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("conversationId", conversationId);

    // Phần Xử lý ảnh //
    if(image instanceof File)
    {
      formData.append("image", image);
    }
    else if(typeof image === "string")
    {
      formData.append("imgUrl", image);
    }
    const res = await api.post("/messages/group", formData);
    return res.data.message;
  },

  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(type: "direct" | "group", name: string, memberIds: string[]) {
    const res = await api.post("/conversations", {type, name, memberIds});
    return res.data.conversation;
  },
  

}