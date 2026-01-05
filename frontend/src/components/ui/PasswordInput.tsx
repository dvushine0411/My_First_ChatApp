import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input'; 

export const PasswordInput = React.forwardRef<
  HTMLInputElement, 
  React.ComponentProps<"input"> 
>(
  (props, ref) => { 
    const [showPassword, setShowPassword] = useState(false);
    
    return (
      <div className="relative">
        <Input
          ref={ref}
          // 1. Dùng logic type đã có
          type={showPassword ? "text" : "password"}
          className="pr-10" // Đảm bảo có padding-right cho icon
          {...props}
        />
        
        {/* 2. THÊM NÚT BẤM VÀ ICON VÀO ĐÂY */}
        <button
          type="button" // RẤT QUAN TRỌNG: Ngăn chặn submit form
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
        >
          {/* 3. Hiển thị icon tương ứng */}
          {showPassword 
            ? <EyeOff className="h-4 w-4" /> 
            : <Eye className="h-4 w-4" />
          }
        </button>
        
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";