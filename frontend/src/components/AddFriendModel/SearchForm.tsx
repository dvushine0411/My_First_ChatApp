import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../Chat/AddFriendModel"; 
import React, { useState, useEffect } from "react";
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input"; 
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Search, Check, Loader2, Send } from "lucide-react";

export interface IFoundUser {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
}

interface SearchFormProps {
    register: UseFormRegister<IFormValues>;
    errors: FieldErrors<IFormValues>;
    loading: boolean;       
    isSending: boolean;     
    usernameValue: string;
    isFound: boolean | null;
    searchedUsername: string;
    foundUser: IFoundUser | null; 
    isFriend: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
    onCancel: () => void;
    onSendRequest: (userId: string, message: string) => void; 
}

const SearchForm = ({
    register,
    errors,
    loading,
    isSending,
    usernameValue,
    isFound,
    searchedUsername,
    foundUser,
    isFriend,
    onSubmit,
    onCancel,
    onSendRequest
}: SearchFormProps) => { 
    
    const [requestMessage, setRequestMessage] = useState("");

    useEffect(() => {
        if (foundUser) {
            setRequestMessage(""); 
        }
    }, [foundUser]);

    const handleSendRequest = () => {
        if (foundUser) {
            onSendRequest(foundUser._id, requestMessage);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold">
                    Tìm kiếm bạn bè
                </Label>

                <div className="flex gap-2">
                    <Input
                        id="username"
                        placeholder="Nhập tên người dùng hoặc email..."
                        className="glass border-border/50 focus:border-primary/50"
                        {...register("username", { required: "Vui lòng nhập từ khóa" })}
                    />
                    <Button 
                        type="submit" 
                        disabled={loading || !usernameValue?.trim()}
                        size="icon"
                        className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
                    >
                         {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                    </Button>
                </div>

                {errors.username && (
                    <p className="text-destructive text-sm">{errors.username.message}</p>
                )}

                {/* --- TRƯỜNG HỢP KHÔNG TÌM THẤY --- */}
                {isFound === false && searchedUsername && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        Không tìm thấy: <span className="font-bold">@{searchedUsername}</span>
                    </div>
                )}

                {/* --- TRƯỜNG HỢP TÌM THẤY USER --- */}
                {isFound === true && foundUser && (
                    <div className="mt-2 p-4 rounded-xl border border-border/50 bg-secondary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* 1. Thông tin User */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {foundUser.avatar ? (
                                    <img src={foundUser.avatar} alt="avatar" className="size-full rounded-full object-cover" />
                                ) : (
                                    (foundUser.displayName?.charAt(0) || "?").toUpperCase()
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">
                                    {foundUser.displayName || foundUser.username}
                                </h4>
                                <p className="text-xs text-muted-foreground">@{foundUser.username}</p>
                            </div>
                        </div>

                        {/* 2. Ô nhập lời nhắn (Chỉ hiện nếu chưa là bạn bè) */}
                        {!isFriend ? (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="message" className="text-xs text-muted-foreground ml-1">
                                        Lời nhắn kết bạn (tùy chọn)
                                    </Label>
                                    <Textarea
                                        id="message"
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="Hãy giới thiệu về bản thân..."
                                        className="resize-none h-20 text-sm bg-white/50 focus:bg-white transition-colors"
                                    />
                                </div>
                                
                                <Button
                                    type="button"
                                    onClick={handleSendRequest}
                                    disabled={isSending}
                                    className="w-full bg-gradient-chat text-white shadow-md hover:opacity-90 transition-all"
                                >
                                    {isSending ? (
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="size-4 mr-2" />
                                    )}
                                    Gửi lời mời
                                </Button>
                            </div>
                        ) : (
                            // 3. Nếu đã là bạn bè
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                                <Check className="size-4" />
                                Các bạn đã là bạn bè
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Đóng
                    </Button>
                </DialogClose>
            </DialogFooter>
        </form>
    );
};

export default SearchForm;