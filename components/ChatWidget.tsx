"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type ChatMessage = {
  roomId: string;
  text: string;
  sender: "user" | "admin";
  created_at?: string;
  is_read: number | string;
};

const socket = io("http://localhost:3001");

export default function ChatWidget() {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 歷史訊息
  useEffect(() => {
    if (!auth.id) return;
    fetch(`http://localhost:3001/api/chat/${auth.id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [auth.id]);

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!auth.id) return;
    const roomId = `user-${auth.id}`;

    socket.emit("join-room", roomId);

    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    // 收到已讀通知
    const handleMessagesRead = () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === "user" ? { ...msg, is_read: 1 } : msg,
        ),
      );
    };

    socket.on("receive-message", handleMessage);
    socket.on("messages-read", handleMessagesRead);

    return () => {
      socket.off("receive-message", handleMessage);
      socket.off("messages-read", handleMessagesRead);
    };
  }, [auth.id]);

  const sendMessage = () => {
    console.log("sendMessage 被呼叫了"); // 看會印幾次
    const message = input.trim();
    if (!message || !auth.id) return;

    const tempMessage: ChatMessage = {
      roomId: `user-${auth.id}`,
      text: message,
      sender: "user",
      created_at: new Date().toISOString(), // 立刻產生時間
      is_read: 0,
    };

    // 樂觀更新：立刻顯示
    setMessages((prev) => [...prev, tempMessage]);
    setInput("");

    // 再送出給後端
    socket.emit("send-message", {
      roomId: `user-${auth.id}`,
      text: message,
      sender: "user",
    });
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
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, isOpen]);

  // 點擊按鈕時的判定邏輯
  const handleToggleChat = () => {
    const targetField = auth?.role;

    if (targetField === "客服") {
      window.location.href = "http://localhost:3000/admin/chat";
      return;
    }

    setIsOpen(!isOpen);
  };

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
            線上客服
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
              return (
                <div
                  key={i}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  {/* 訊息本體與時間的容器：使用 flex 讓它們左右排列 */}
                  <div
                    className={`flex items-end gap-2 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* 訊息氣泡 */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                        isUser
                          ? "rounded-br-none bg-[#45cad5] text-white"
                          : "rounded-bl-none border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* 時間與已讀狀態（會因為 flex-row-reverse 而自動排在使用者氣泡的左側） */}
                    <div className="mb-1 flex items-center gap-1 text-[11px] whitespace-nowrap text-gray-400">
                      <div className="flex flex-col">
                        {isUser && (
                          <div className="text-end">
                            {Number(m.is_read) === 1 ? "已讀" : "未讀"}
                          </div>
                        )}
                        <div>{formatTime(m.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 輸入區 */}
          {/* 輸入區 */}
          <div className="border-t bg-white p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter 送出，Shift + Enter 換行
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="輸入訊息...（Shift + Enter 換行）"
                rows={1}
                className="max-h-32 min-h-[44px] flex-1 resize-none overflow-y-auto rounded-xl border border-gray-300 px-4 py-3 text-sm text-black focus:border-[#45cad5] focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-[#45cad5] p-3 text-white transition-colors hover:bg-[#45cad5]"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
