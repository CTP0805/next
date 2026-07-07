
export default function content() {
    return (
        <>
            <section className="content">
                    {/* Banner */}
                    <div className="point-banner">
                        <div className="point-info">
                            <h1>0</h1>
                            <p >累積紅利點，即可折抵下次消費金額</p>
                        </div>
                        <div className="exchange bg-amber-50 w-[80px] h-[32px] rounded-[2px]">
                            <a href="./level/points" className="">
                                傻幣詳情
                            </a>
                        </div>
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
        </>
    );
}


