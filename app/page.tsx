import "./member.css";
import Image from "next/image";

export default function Member() {
    return (
        <>
            {/* Header */}
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

            {/* Main */}
            <div className="container">
                <aside className="sidebar">
                    <div className="profile">
                        <Image className="avatar" src="" alt=""/>
                        <h2>王大明</h2>
                    </div>
                    <ul>
                        <li>會員資料</li>
                        <li>會員等級</li>
                        <li>我的訂單</li>
                        <li className="active">我的優惠</li>
                        <li>我的評價</li>
                        <li>收藏清單</li>
                        <li>最近瀏覽</li>
                    </ul>
                </aside>

                {/* 右側 */}
                <section className="content">
                    {/* Banner */}
                    <div className="point-banner">
                        <div className="point-info">
                            <h1>0</h1>
                            <p >累積紅利點，即可折抵下次消費金額</p>
                        </div>
                    </div>
                        <div className="exchange">
                            兌換詳情
                        </div>
                    {/* Tabs */}
                    <div className="tabs">
                        <button className="active">全部</button>
                        <button>已獲得</button>
                        <button>已使用</button>
                        <button>已過期</button>
                    </div>
                    {/* List */}

                    <div className="history">
                        <div className="history-item">
                            <div>
                                <div className="date">
                                    2023/08/17
                                </div>
                                <div className="title">
                                    購買活動消費
                                </div>
                            </div>
                            <span className="minus">
                                -46
                            </span>
                        </div>
                        <div className="history-item">
                            <div>
                                <div className="date">
                                    2023/08/16
                                </div>
                                <div className="title">
                                    購買活動消費 No-show Refund
                                </div>
                                <div className="order">
                                    訂單編號:540051526
                                </div>
                            </div>
                            <span className="plus">
                                +14
                            </span>
                        </div>
                        <div className="history-item">
                            <div>
                                <div className="date">
                                    2023/08/14
                                </div>
                                <div className="title">
                                    購買活動消費 日本JR關西地區鐵路周遊券
                                </div>
                                <div className="order">
                                    訂單編號:540051234
                                </div>
                            </div>
                            <span className="plus">
                                +32
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}