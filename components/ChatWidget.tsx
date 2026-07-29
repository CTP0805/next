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
};

const socket = io("http://localhost:3001");

export default function ChatWidget() {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [member, setMember] = useState<any>(null); // 會員資料
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 抓取會員資料（修正相依陣列避免無限迴圈）
  useEffect(() => {
    fetch(`http://localhost:3001/api/member/profile`, {
      method: "GET",
      credentials: "include", // 帶上 cookie 驗證身份
    })
      .then((res) => res.json())
      .then((data) => setMember(data.data))
      .catch((error) => console.error(error));
  }, []);

  // 2. 歷史訊息
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

    socket.emit("join-room", `${roomId}`);

    const handleMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [auth.id]);

  const sendMessage = () => {
    if (input.trim()) {
      setInput("");
      socket.emit("send-message", {
        roomId: `user-${auth.id}`,
        text: input,
        sender: "user",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, isOpen]);

  // 3. 點擊按鈕時的判定邏輯
  const handleToggleChat = () => {
    // 假設你的欄位名稱叫 fieldName (請依你的 member 屬性自行修改，例如 member.role 或 member.status)
    const targetField = member?.role; // 或者是 member?.role 等等

    if (targetField === "客服") {
      // 判定等於客服時：不開啟彈跳視窗，改為給予連結或直接跳轉頁面
      window.location.href = "http://localhost:3000/admin/chat";
      return;
    }

    // 若不是客服，維持原本正常開啟/關閉彈跳視窗的行為
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

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.sender === "user"
                      ? "rounded-br-none bg-[#45cad5] text-white"
                      : "rounded-bl-none border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 輸入區 */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="輸入訊息..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-black focus:border-[#45cad5] focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-[#45cad5] p-3 text-white transition-colors hover:bg-[#45cad5]"
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;

                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
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
