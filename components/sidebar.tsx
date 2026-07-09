"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/member.css";

export default function sidebar() {
    return (
        <aside className="sidebar">
            <div className="profile">
                
                <h2>王大明</h2>
            </div>
            <ul>
                <li>
                    <Link href="/member/profile">
                        會員資料
                    </Link>
                </li>
                <li>
                    <Link href="/member/level">
                        會員等級
                    </Link>
                </li>
                <li>
                    <Link href="/member/order">
                        我的訂單
                    </Link>
                </li>
                <li>
                    <Link href="/member/level" className="active">
                        我的優惠
                    </Link>
                </li>
                <li>我的評價</li>
                <li>收藏清單</li>
                <li>最近瀏覽</li>
            </ul>
        </aside>
    )
}
