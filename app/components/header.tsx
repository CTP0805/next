"use client";

import Image from "next/image";

export default function Header() {
    return (
            <header className="header">
                <div className="logo">
                    {/* Logo */}
                    <Image src="" alt="" />
                </div>
                <nav>
                    <a href="">基礎點</a>
                    <a href="">關於分潤</a>
                    <a href="">關於我們</a>
                    <a href="">聯絡我們</a>
                </nav>
                <div className="user-area">
                    <span className="cart">🛒</span>
                    <Image className="header-avatar" src="/test.png" alt="" width={32} height={32} />
                    <span>您好，王大明</span>
                </div>
            </header>
    )
}