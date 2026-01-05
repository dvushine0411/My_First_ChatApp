import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';
import { persist } from 'zustand/middleware';
import { useChatStore } from './useChatStore';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,

            setAccessToken: (accessToken) => set({ accessToken }),

            // --- HÀM CLEAR STATE (ĐÃ SỬA ĐỂ KHÔNG BỊ CRASH) ---
            clearState: () => {
                set({ accessToken: null, user: null, loading: false });
                
                // Xóa trực tiếp LocalStorage thay vì gọi Store khác
                localStorage.clear();
                useChatStore.getState().reset();
            },

            signUp: async (username, password, email, firstname, lastname) => {
                try {
                    set({ loading: true });
                    await authService.signUp(username, password, email, firstname, lastname);
                    toast.success("Đăng ký thành công! Hãy đăng nhập.");
                } catch (error) {
                    console.log(error);
                    toast.error("Đăng ký thất bại.");
                } finally {
                    set({ loading: false });
                }
            },

            signIn: async (username, password) => {
                try {
                    set({ loading: true });

                    // 1. Dọn dẹp dữ liệu cũ trước
                    localStorage.clear();

                    // 2. Gọi API
                    const { accessToken } = await authService.signIn(username, password);

                    // 3. Lưu token
                    get().setAccessToken(accessToken);
                    await get().fetchMe();

                    // Đưa ra giao diện conversations // 
                    // useChatStore.getState().fetchConversations();   

                    toast.success("Đăng nhập thành công!");
                } catch (error) {
                    console.log(error);
                    toast.error("Đăng nhập thất bại.");
                } finally {
                    set({ loading: false });
                }
            },

            signOut: async () => {
                try {
                    await authService.signOut();
                } catch (error) {
                    console.error("Lỗi logout API:", error);
                } finally {
                    // Gọi hàm dọn dẹp an toàn ở trên
                    get().clearState();
                }
            },

            fetchMe: async () => {
                try {
                    const user = await authService.fetchMe();
                    set({ user });
                } catch (error) {
                    // Nếu lỗi (hết hạn token) -> Logout ngay
                    get().clearState();
                }
            },
            
            // ... giữ nguyên hàm refresh nếu có ...
             refresh: async () => {
                try {
                    const { user, fetchMe, setAccessToken } = get();
                    const accessToken = await authService.refresh();
                    setAccessToken(accessToken);    
                    if(!user) {
                        await fetchMe();
                    }
                } catch (error) {
                    console.error(error);
                    // Refresh lỗi -> Logout
                    get().clearState();         
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user}),
        }
    )
);