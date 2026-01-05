import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader } from '../ui/dialog';
import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react"; // [FIX 1]: Import useEffect
import { useForm, type SubmitHandler } from 'react-hook-form'; 
import SearchForm, { type IFoundUser } from '../AddFriendModel/SearchForm';
import { useFriendStore } from '@/stores/useFriendStore';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore'; // [FIX 2]: Import auth store

export interface IFormValues {
    username: string;
    message?: string; 
}   

export const AddFriendModel = () => {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset, 
        formState: { errors }
    } = useForm<IFormValues>({
        defaultValues: { username: "", message: "" }
    });

    const usernameValue = watch("username");

    const [isSending, setIsSending] = useState(false);
    const [isFound, setIsFound] = useState<boolean | null>(null);
    const [searchedUsername, setSearchedUsername] = useState("");
    const [foundUser, setFoundUser] = useState<IFoundUser | null>(null);
    
    // [FIX 3]: Lấy hàm getFriends để load dữ liệu
    const { loading, searchByUsername, addFriend, friends, getAllFriends } = useFriendStore();
    
    const [isFriend, setisFriend] = useState(false);

    // [FIX 4]: Lấy user hiện tại để so sánh
    const currentUser = useAuthStore().user;

    // [FIX 5 - QUAN TRỌNG NHẤT]: Load danh sách bạn bè khi mở Modal
    useEffect(() => {
        if (open) {
            getAllFriends(); 
        }
    }, [open, getAllFriends]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset();
            setIsFound(null);
            setFoundUser(null);
            setSearchedUsername("");
            setisFriend(false);
        }
    };

    const onSearchSubmit: SubmitHandler<IFormValues> = async (data) => {
        const username = data.username.trim();
        if(!username)   return;

        setIsFound(null);
        setFoundUser(null);
        setSearchedUsername(username);

        try {
            const resultUser = await searchByUsername(username);  
            
            if(resultUser)
            {
                const alreadyFriend = friends.some((f) => f._id === resultUser._id);
                
                const isMe = currentUser?._id === resultUser._id;

                setIsFound(true);
                setFoundUser(resultUser);
                
                setisFriend(alreadyFriend || isMe);
            }
            else
            {
                setIsFound(false);
            }

        } catch (error) {
            console.error(error);
            setIsFound(false);
        } 
    };

    const handleSendRequest = async (To_User: string, message: string) => {
        if(!foundUser)    return;
        
        // Chặn gửi nếu đã là bạn (UI safety)
        if(isFriend) {
            toast.info("Người này đã là bạn bè rồi");
            return;
        }

        setIsSending(true);

        try {
            await addFriend(To_User, message);
            toast.success("Gửi lời mời kết bạn thành công");
            handleOpenChange(false);
        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn");
            toast.error("Có lỗi khi gửi lời mời. Xin vui lòng thử lại!")
            handleOpenChange(true);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div className="flex justify-center items-center size-8 rounded-full hover:bg-sidebar-accent cursor-pointer z-10 transition-colors">
                    <UserPlus className="size-5 text-sidebar-foreground"/>
                    <span className="sr-only">Thêm bạn bè</span>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] border-none shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">Thêm bạn mới</DialogTitle>
                </DialogHeader>

                <SearchForm 
                    register={register}
                    errors={errors}
                    onSubmit={handleSubmit(onSearchSubmit,
                        (errors) => console.log("Lỗi validation: ", errors)
                    )}
                    
                    loading={loading}
                    isSending={isSending}
                    usernameValue={usernameValue || ""}
                    isFound={isFound}
                    searchedUsername={searchedUsername}
                    foundUser={foundUser}
                    
                    // Truyền biến check xuống
                    isFriend={isFriend}
                    
                    onCancel={() => handleOpenChange(false)}
                    onSendRequest={handleSendRequest}
                />

            </DialogContent>
        </Dialog>
    );
};