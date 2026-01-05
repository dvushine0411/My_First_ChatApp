import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatOnlineTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 60) {
    return `${diffMins}m`; // 5m, 45m
  } else if (diffHours < 24) {
    return `${diffHours}h`; // 3h, 20h
  } else if (diffDays < 30) {
    return `${diffDays}d`; // 1d, 12d
  } else if (diffMonths < 12) {
    return `${diffMonths}m`; // 1m, 2m, 11m
  } else {
    return `${diffYears}y`; // 1y, 2y
  }
};

// export const formatMessageTime = (date: Date) => {
//   const now = new Date();

//   const isToday =
//     date.getDate() === now.getDate() &&
//     date.getMonth() === now.getMonth() &&
//     date.getFullYear() === now.getFullYear();

//   const yesterday = new Date();
//   yesterday.setDate(now.getDate() - 1);
//   const isYesterday =
//     date.getDate() === yesterday.getDate() &&
//     date.getMonth() === yesterday.getMonth() &&
//     date.getFullYear() === yesterday.getFullYear();

//   const timeStr = date.toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });

//   if (isToday) {
//     return timeStr; // ví dụ: "14:35"
//   } else if (isYesterday) {
//     return `Hôm qua ${timeStr}`; // ví dụ: "Hôm qua 23:10"
//   } else if (date.getFullYear() === now.getFullYear()) {
//     return `${date.getDate()}/${date.getMonth() + 1} ${timeStr}`; // ví dụ: "22/9 09:15"
//   } else {
//     return `${date.getDate()}/${
//       date.getMonth() + 1
//     }/${date.getFullYear()} ${timeStr}`; // ví dụ: "15/12/2023 18:40"
//   }
// };

export const formatMessageTime = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const now = new Date();

  // 1. Lấy giờ phút (Ví dụ: "13:30")
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Đưa về cùng mốc 00:00:00 để tính khoảng cách ngày
  const d1 = new Date(date);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(now);
  d2.setHours(0, 0, 0, 0);

  // Tính số ngày chênh lệch
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // --- TRƯỜNG HỢP 1: HÔM NAY ---
  // Output: "13:30"
  if (diffDays === 0) {
    return timeStr;
  }

  // --- TRƯỜNG HỢP 2: TRONG VÒNG 1 TUẦN ---
  // Output: "13:30 T5", "13:30 CN"
  if (diffDays < 7) {
    // Mảng map thứ trong tuần ra T2, T3...
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayLabel = days[date.getDay()]; // date.getDay() trả về 0 -> 6 (CN -> T7)
    
    return `${timeStr} ${dayLabel}`;
  }

  // --- TRƯỜNG HỢP 3: LÂU HƠN ---
  const pad = (num: number) => num.toString().padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  // Nếu khác năm hiện tại: "13:30 20/12/2023"
  if (date.getFullYear() !== now.getFullYear()) {
    return `${timeStr} ${day}/${month}/${year}`;
  }

  // Nếu cùng năm: "13:30 20/12"
  return `${timeStr} ${day}/${month}`;
};
