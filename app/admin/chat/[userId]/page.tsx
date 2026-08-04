"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";

const socket = io("http://localhost:3001");
import { useAuth } from "@/contexts/auth-context";
type ChatMessage = {
  roomId?: string;
  text: string;
  image_url?: string;
  sender: "user" | "admin";
  created_at?: string;
  is_read?: number | string;
};

export default function AdminChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const params = useParams<{ userId: string }>();
  const roomId = `user-${params.userId}`;
  const { auth } = useAuth();
  useEffect(() => {
    if (!auth.id) return;

    // 通知後端客服在線
    socket.emit("admin-online", {
      adminId: auth.id,
    });
  }, [auth.id]);
  // 只滾動聊天區域，不影響整個頁面
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 進入時標記已讀 + 載入歷史訊息
  useEffect(() => {
    if (!params.userId) return;

    fetch(`http://localhost:3001/api/chat/${params.userId}/read`, {
      method: "PATCH",
    });

    fetch(`http://localhost:3001/api/chat/${params.userId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [params.userId]);

  // Socket 監聽
  useEffect(() => {
    if (!params.userId || !auth.id) return;

    // 通知 Server 客服在線

    // 加入會員聊天室
    socket.emit("join-room", roomId);

    socket.emit("mark-as-read", {
      userId: Number(params.userId),
    });
    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);

      if (data.sender === "user") {
        socket.emit("mark-as-read", {
          userId: Number(params.userId),
        });
      }
    };

    const handleUserTyping = () => {
      setIsUserTyping(true);

      setTimeout(() => {
        setIsUserTyping(false);
      }, 1000);
    };

    socket.on("receive-message", handleMessage);
    socket.on("user-typing", handleUserTyping);

    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("user-typing", handleUserTyping);
    };
  }, [params.userId, roomId, auth.id]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const tempMessage: ChatMessage = {
      roomId,
      text: input,
      sender: "admin",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("send-message", {
      roomId,
      text: input,
      sender: "admin",
    });

    setInput("");
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageSrc = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("http")) return url;
    return `http://localhost:3001${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">客服聊天室</h1>
          <p className="text-sm text-gray-500">會員 ID：{params.userId}</p>
        </div>
        <Link href="/admin/chat">
          <button className="rounded-xl bg-[#45cad5] px-4 py-2 text-sm text-white transition hover:bg-[#3bb8c3]">
            返回列表
          </button>
        </Link>
      </div>

      {/* 訊息區域 */}
      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-6"
      >
        {messages.length === 0 && (
          <div className="mt-20 text-center text-gray-400">目前沒有訊息</div>
        )}

        {messages.map((m, i) => {
          const isAdmin = m.sender === "admin";
          const hasImage = !!m.image_url;
          const hasText = !!m.text?.trim();

          return (
            <div
              key={`${m.created_at}-${i}`}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[70%] flex-col ${
                  isAdmin ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`overflow-hidden ${
                    hasImage && !hasText
                      ? ""
                      : `rounded-2xl px-4 py-2 text-sm ${
                          isAdmin
                            ? "rounded-br-none bg-[#45cad5] text-white"
                            : "rounded-bl-none border border-gray-200 bg-white text-gray-800"
                        }`
                  }`}
                >
                  {hasImage && (
                    <div className={hasText ? "mb-2" : ""}>
                      <img
                        src={getImageSrc(m.image_url)}
                        alt="圖片"
                        className="block max-h-[280px] max-w-[240px] rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {hasText && (
                    <div className="wrap-break-word whitespace-pre-wrap">
                      {m.text}
                    </div>
                  )}
                </div>

                <div className="mt-1 text-[11px] text-gray-400">
                  {formatTime(m.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區 */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              console.log("送出 admin typing", roomId);

              socket.emit("admin-typing", {
                roomId,
              });
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="輸入回覆...（Enter 發送，Shift + Enter 換行）"
            rows={1}
            className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#45cad5]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#45cad5] text-white transition hover:bg-[#3bb8c3] disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
