"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { FaRegImage } from "react-icons/fa6";

type ChatMessage = {
  roomId: string;
  text: string;
  image_url?: string;
  sender: "user" | "admin";
  created_at?: string;
  is_read: number | string;
  tempId?: string;
};

const socket = io("http://localhost:3001");

export default function ChatWidget() {
  const { auth, isAuthenticated } = useAuth();
  // 沒有登入就不顯示聊天室
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  // 歷史訊息
  useEffect(() => {
    if (!auth.id) return;
    fetch(`http://localhost:3001/api/chat/${auth.id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [auth.id]);
  useEffect(() => {
    const handleAdminStatus = (data: { online: boolean }) => {
      console.log("客服狀態:", data);
      setAdminOnline(data.online);
    };

    socket.on("admin-status", handleAdminStatus);

    return () => {
      socket.off("admin-status", handleAdminStatus);
    };
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!auth.id) return;
    const roomId = `user-${auth.id}`;

    socket.emit("join-room", roomId);
    socket.emit("check-admin-status");
    const handleMessage = (data: ChatMessage) => {
      // 客服送出後停止顯示輸入中
      if (data.sender === "admin") {
        setIsAdminTyping(false);
      }

      setMessages((prev) => {
        const tempIndex = prev.findLastIndex((m) => m.tempId);

        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = { ...data };
          return newMessages;
        }

        return [...prev, data];
      });
    };

    const handleMessagesRead = () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === "user" ? { ...msg, is_read: 1 } : msg,
        ),
      );
    };

    const handleAdminTyping = () => {
      setIsAdminTyping(true);
      // 確保看得到
      requestAnimationFrame(() => scrollToBottom());
    };
    socket.on("receive-message", handleMessage);
    socket.on("messages-read", handleMessagesRead);
    socket.on("admin-typing", handleAdminTyping);
    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("messages-read", handleMessagesRead);
      socket.off("admin-typing", handleAdminTyping);
    };
  }, [auth.id]);

  // 發送文字訊息
  const sendMessage = () => {
    const message = input.trim();
    if (!message || !auth.id) return;

    const tempId = `temp-${Date.now()}`;

    const tempMessage: ChatMessage = {
      roomId: `user-${auth.id}`,
      text: message,
      sender: "user",
      created_at: new Date().toISOString(),
      is_read: 0,
      tempId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    socket.emit("send-message", {
      roomId: `user-${auth.id}`,
      text: message,
      sender: "user",
    });
  };

  // 選擇圖片 → 只做預覽
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("只能上傳圖片檔案");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("圖片大小不能超過 5MB");
      e.target.value = "";
      return;
    }

    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
    }

    const url = URL.createObjectURL(file);
    setPreviewImage({ file, url });
    e.target.value = "";
  };

  // 取消預覽
  const cancelPreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
      setPreviewImage(null);
    }
  };

  // 確認發送圖片（可附帶文字）
  const confirmSendImage = async () => {
    if (!previewImage || !auth.id) return;

    setIsUploading(true);

    const tempUrl = previewImage.url;
    const tempId = `temp-${Date.now()}`;
    const file = previewImage.file;
    const messageText = input.trim();

    // 樂觀更新
    const tempMessage: ChatMessage = {
      roomId: `user-${auth.id}`,
      text: messageText,
      image_url: tempUrl,
      sender: "user",
      created_at: new Date().toISOString(),
      is_read: 0,
      tempId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setPreviewImage(null);
    setInput("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("http://localhost:3001/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("上傳失敗");

      const data = await res.json();
      console.log("上傳成功:", data);

      socket.emit("send-message", {
        roomId: `user-${auth.id}`,
        text: messageText,
        image_url: data.imageUrl,
        sender: "user",
      });
    } catch (error) {
      console.error("圖片上傳失敗:", error);

      setMessages((prev) => {
        const target = prev.find((m) => m.tempId === tempId);
        if (target?.image_url?.startsWith("blob:")) {
          URL.revokeObjectURL(target.image_url);
        }
        return prev.filter((m) => m.tempId !== tempId);
      });

      alert("圖片上傳失敗，請再試一次");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => scrollToBottom());
    }
  }, [messages, isOpen]);

  const handleToggleChat = () => {
    if (auth?.role === "客服") {
      window.location.href = "http://localhost:3000/admin/chat";
      return;
    }
    setIsOpen(!isOpen);
  };

  const getImageSrc = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `http://localhost:3001${url.startsWith("/") ? "" : "/"}${url}`;
  };
  if (!isAuthenticated) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={handleToggleChat}
        className="rounded-full bg-[#45cad5] p-4 text-white shadow-lg transition-colors hover:bg-[#45cad5]"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-20 flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 bg-[#45cad5] p-4 font-semibold text-white">
            線上客服{" "}
            <div className="text-xs">{adminOnline ? "🟢 " : "⚪ "}</div>
          </div>

          {/* 訊息區域 */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <div className="mt-8 text-center text-sm text-gray-400">
                您好！有什麼可以為您服務的嗎？
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.sender === "user";
              const hasImage = !!m.image_url;
              const hasText = !!m.text?.trim();

              return (
                <div
                  key={m.tempId || `${m.created_at}-${i}`}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex items-end gap-2 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* ===== 訊息本體 ===== */}
                    <div
                      className={`max-w-[75%] overflow-hidden ${
                        hasImage && !hasText
                          ? "" // 純圖片不需要氣泡背景
                          : `rounded-2xl px-3 py-2 text-[13px] leading-5 ${
                              isUser
                                ? "rounded-br-none bg-[#45cad5] text-white"
                                : "rounded-bl-none border border-gray-200 bg-white text-gray-800"
                            }`
                      }`}
                    >
                      {/* 圖片 */}
                      {hasImage && (
                        <div className={`${hasText ? "mb-2" : ""}`}>
                          <img
                            src={getImageSrc(m.image_url)}
                            alt="圖片"
                            className="block max-h-[260px] w-full max-w-[220px] rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              console.error("圖片載入失敗:", m.image_url);
                            }}
                          />
                        </div>
                      )}

                      {/* 文字 */}
                      {hasText && (
                        <div className="wrap-break-word whitespace-pre-wrap">
                          {m.text}
                        </div>
                      )}
                    </div>

                    {/* 時間與已讀 */}
                    <div className="mb-1 flex flex-col items-end gap-0.5 text-[10px] whitespace-nowrap text-gray-400">
                      {isUser && (
                        <div>{Number(m.is_read) === 1 ? "已讀" : "未讀"}</div>
                      )}
                      <div>{formatTime(m.created_at)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isAdminTyping && (
              <div className="text-xs text-gray-400 italic">客服回覆中...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 輸入區 */}
          <div className="border-t bg-white p-3">
            <div className="flex items-end gap-2">
              {/* 圖片選擇 */}
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleSelectImage}
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`mb-2 flex-shrink-0 text-xl text-gray-500 hover:text-[#45cad5] ${
                  isUploading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {isUploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : (
                  <FaRegImage />
                )}
              </button>

              {/* 輸入框（含縮圖預覽） */}
              <div className="relative flex flex-1 items-end rounded-2xl border border-gray-300 bg-white focus-within:border-[#45cad5]">
                {previewImage && (
                  <div className="relative mb-2 ml-2 flex-shrink-0">
                    <img
                      src={previewImage.url}
                      alt="預覽"
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <button
                      onClick={cancelPreview}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      if (previewImage) {
                        confirmSendImage();
                      } else {
                        sendMessage();
                      }
                    }
                  }}

                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-sm text-black outline-none"
                />
              </div>

              {/* 發送按鈕 */}
              <button
                onClick={() => {
                  if (previewImage) {
                    confirmSendImage();
                  } else {
                    sendMessage();
                  }
                }}
                disabled={isUploading || (!input.trim() && !previewImage)}
                className="mb-1 flex-shrink-0 rounded-full bg-[#45cad5] p-3 text-white transition-colors hover:bg-[#3bb8c3] disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
