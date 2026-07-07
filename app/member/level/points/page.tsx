import Image from "next/image";
import Header from "@/components/header";
import "./content.css";
// import Sidebar from "@/components/sidebar";   // 如果不需要可先註解

export default function Member() {
  return (
    <>
      <Header />
      
      <main className="benefits-page">
        <section className="hero-section ">
            <div className="hero-container">
              <div className="hero-text">
                <h1>體驗活動賺取優幣</h1>
                <p>完成活動簽到即可賺取優幣，大優幣可用於折抵下次消費</p>
                <button className="cta-button">查看大優幣</button>
              </div>

              <div className="hero-image">
                <Image src="/images/hero-surfer.png" alt="衝浪賺優幣" width={420} height={380} priority className="drop-shadow-xl bg-amber-100"/>
              </div>
            </div>
          </section>
        <div className="content-wrapper bg-amber-500">
          {/* 大優幣是什麼？ */}
          <section className="what-is-section">
            <div className="section-container">
              <h2>大優幣是甚麼？</h2>
              <p>
                MaoDay 專屬虛擬貨幣系統。透過完成平台內的各項體驗活動與留下真實評價即可獲得。
              </p>
              <p className="highlight">
                （1 優幣 = 1 元台幣，可用於折抵住宿、體驗、餐飲等消費）
              </p>
            </div>
          </section>

          {/* 大優幣怎麼拿 */}
          <section className="earn-section">
            <div className="section-container">
              <h2>大優幣怎麼拿</h2>
              
              <div className="earn-grid">
                <div className="earn-card">
                  <div className="icon">🎟️</div>
                  <h3>完成活動</h3>
                  <p>參加平台舉辦的各式體驗活動，簽到後即可獲得對應優幣獎勵</p>
                </div>

                <div className="earn-card">
                  <div className="icon">⭐</div>
                  <h3>留下評價</h3>
                  <p>體驗結束後撰寫真實評價與照片，即可獲得平台給予的優幣回饋</p>
                </div>
              </div>
            </div>
          </section>

          {/* 優幣怎麼用？ */}
          <section className="use-section">
            <div className="section-container">
              <h2>優幣怎麼用？</h2>
              <p>
                累積的優幣可在預訂住宿、體驗活動、餐飲合作店家時直接折抵消費金額。
              </p>
              <p className="note">未來將開放更多兌換方式，敬請期待！</p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}