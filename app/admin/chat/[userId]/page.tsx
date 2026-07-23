"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "next/navigation";
const socket = io("http://localhost:3001");

type ChatMessage = {
  roomId: string;
  text: string;
  sender: "user" | "admin";
};

export default function AdminChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const params = useParams<{
    userId: string;
  }>();

  useEffect(() => {
    fetch(`http://localhost:3001/api/chat/${params.userId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [params.userId]);
  const roomId = `user-${params.userId}`;
  useEffect(() => {
    // 加入會員聊天室
    socket.emit("join-room", roomId);

    socket.on("receive-message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("send-message", {
      roomId,

      text: input,

      sender: "admin",
    });

    setInput("");
  };

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <h1 className="">客服聊天室</h1>

        <Link href="/admin/chat">
          <button className="rounded-[12px] bg-[#45cad5] px-4 py-2 text-white">
            返回
          </button>
        </Link>
      </div>
      <div className="mt-5 h-96 border p-5">
        {messages.map((m, index) => (
          <div key={index}>
            {m.sender}：{m.text}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 text-black">
        <input
          className="border-black text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="w-20 rounded-[12px] bg-[#45cad5] text-white"
          onClick={sendMessage}
        >
          發送
        </button>
      </div>
    </div>
  );
}
