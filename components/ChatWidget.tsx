"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { MessageCircle, X, Send } from "lucide-react";

const socket = io("http://localhost:3000");

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "admin" }[]
  >([
    // 假資料
    { text: "您好，請問有什麼可以幫您的？", sender: "admin" },
    { text: "我想查詢訂單編號 #A123456 的出貨進度", sender: "user" },
    { text: "好的，請稍等，我幫您查詢。", sender: "admin" },
    { text: "您的訂單目前已出貨，正在配送中，預計明天送達。", sender: "admin" },
    { text: "謝謝！那我可以修改收件地址嗎？", sender: "user" },
    { text: "可以的，請提供新的收件地址和電話，我幫您處理。", sender: "admin" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("receive-message", (msg: string) => {
      setMessages((prev) => [...prev, { text: msg, sender: "admin" }]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("send-message", input);
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-blue-600 p-4 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-20 flex h-[480px] w-80 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 bg-blue-600 p-4 font-semibold text-white">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"></div> */}
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
                      ? "rounded-br-none bg-blue-600 text-white"
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
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
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
