import {create} from 'zustand';
import type { ThemeState } from '@/types/store';
import {persist} from 'zustand/middleware';
import { isDirty } from 'zod/v3';

export const useThemeStore = create<ThemeState>() (
    persist(
        (set, get) => ({
            isDark: false,

            toggleTheme: () => {
                const NewValue = !get().isDark;
                set({isDark: NewValue});

                if(NewValue)
                {
                    document.documentElement.classList.add("dark");
                }
                else document.documentElement.classList.remove("dark");
            },

            setTheme: (dark: boolean) => {
                set({isDark: dark});
                if(dark)
                {
                    document.documentElement.classList.add("dark");
                }
                else document.documentElement.classList.remove("dark");
            },

        }),
        {
            name: "theme-storage"
        }

    )
)