"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
type RoomList = {
  name: string;
  room_id: number;
  user_id: number;
};

export default function ChatListPage() {
  const [rooms, setRooms] = useState<RoomList[]>([]);
  useEffect(() => {
    const getRooms = async () => {
      const res = await fetch(`http://localhost:3001/api/chat/users`);
      const data = await res.json();

      setRooms(data);
    };
    getRooms();

    const timer = setInterval(getRooms, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">客服聊天室</h1>

      {rooms.map((user) => (
        <Link
          key={user.room_id}
          href={`/admin/chat/${user.user_id}`}
          className="mb-3 block rounded-lg border p-4 hover:bg-gray-100"
        >
          {user.name}
        </Link>
      ))}
    </div>
  );
}
