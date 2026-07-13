import Link from "next/link";
import "./points.css";

export default function PointsPage() {
  return (
    <main className="benefits-page">
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-text">
            <h1>體驗活動賺取傻幣</h1>
            <p>完成活動簽到即可賺取傻幣，大傻幣可用於折抵下次消費</p>
            <Link href="/member/coupon" className="cta-button">
              查看大傻幣
            </Link>
          </div>
        </div>
      </section>

      <div className="content-wrapper">
        {/* 大傻幣是什麼？ */}
        <section className="what-is-section">
          <div className="section-container">
            <h2>大傻幣是什麼？</h2>
            <p>
              MaoDay 專屬虛擬貨幣系統。透過完成平台內的各項體驗活動與留下真實評價即可獲得。
            </p>
            <p className="highlight">
              （1 傻幣 = 1 元台幣，可用於折抵住宿、體驗、餐飲等消費）
            </p>
          </div>
        </section>

        {/* 大傻幣怎麼拿 */}
        <section className="earn-section">
          <div className="section-container">
            <h2>大傻幣怎麼拿</h2>

            <div className="earn-grid">
              <div className="earn-card">
                <div className="icon">🎟️</div>
                <h3>完成活動</h3>
                <p>參加平台舉辦的各式體驗活動，簽到後即可獲得對應傻幣獎勵</p>
              </div>

              <div className="earn-card">
                <div className="icon">⭐</div>
                <h3>留下評價</h3>
                <p>體驗結束後撰寫真實評價與照片，即可獲得平台給予的傻幣回饋</p>
              </div>
            </div>
          </div>
        </section>

        {/* 傻幣怎麼用？ */}
        <section className="use-section">
          <div className="section-container">
            <h2>傻幣怎麼用？</h2>
            <p>
              累積的傻幣可在預訂住宿、體驗活動、餐飲合作店家時直接折抵消費金額。
            </p>
            <p className="note">未來將開放更多兌換方式，敬請期待！</p>
          </div>
        </section>
      </div>
    </main>
  );
}
