export default function Loading() {
  return (
    <main className="logo-loading" aria-label="頁面載入中">
      <div className="logo-loading__content">
        <div className="logo-loading__mark">
          <svg
            className="logo-loading__ring"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="68 202"
            />
          </svg>

          {/* 用 Logo 當遮罩，才能將原本白色 Logo 顯示為灰色 */}
          <span className="logo-loading__image" aria-hidden="true" />
        </div>

        <p className="logo-loading__text">再一下下就好...</p>
      </div>

      <style>{`
        .logo-loading {
          height: 100dvh;
          display: grid;
          place-items: center;
          background: transparent;
        }

        .logo-loading__content {
          display: grid;
          justify-items: center;
          gap: 1rem;
        }

        .logo-loading__mark {
          position: relative;
          display: grid;
          place-items: center;
          width: 144px;
          aspect-ratio: 1;
        }

        .logo-loading__ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          animation: logo-loading-spin 1.1s linear infinite;
        }

        .logo-loading__image {
          width: 72px;
          aspect-ratio: 18 / 16;
          background: #6b7280;
          -webkit-mask: url("/icon/logo.svg") center / contain no-repeat;
          mask: url("/icon/logo.svg") center / contain no-repeat;
          animation: logo-loading-breathe 1.1s ease-in-out infinite alternate;
        }

        .logo-loading__text {
          margin: 0;
          color: #6b7280;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        @keyframes logo-loading-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes logo-loading-breathe {
          to {
            transform: scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-loading__ring,
          .logo-loading__image {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}