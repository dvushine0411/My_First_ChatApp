import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
// 👇 Import cái này để giao diện nó khớp với Sidebar

const GroupChatList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    // Lọc lấy group (Sửa tên biến khác tên Component)
    const groups = conversations.filter((conver) => conver.type === "group");

    console.log(groups);

    if (groups.length === 0) {
        return <div className="p-4 text-xs text-muted-foreground text-center">Chưa có nhóm nào</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {groups.map((conver) => (
                    <GroupChatCard conver={conver} key={conver._id}/>
            ))}
        </div>
    );
}

export default GroupChatList;