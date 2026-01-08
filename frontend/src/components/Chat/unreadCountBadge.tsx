import { Badge } from "../ui/badge"


const unreadCountBadge = ({unreadCount}: {unreadCount: number}) => {
    return (
        <div className="absolute z-20 -top-1 -right-1">
            <Badge
                variant="destructive"
                className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900"
            >
                {unreadCount > 9 ? "9+" : unreadCount}

            </Badge>
        </div>
    )

}


export default unreadCountBadge;