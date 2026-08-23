import { ImageResponse } from "next/og";

export const alt = "PathLogs UI — React components, hooks and widgets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Картинка для превью в соцсетях и мессенджерах.
 *
 * Текст только латиницей и намеренно: встроенный шрифт ImageResponse
 * не покрывает кириллицу, а тянуть файл шрифта из сети на каждой сборке —
 * лишняя точка отказа ради подписи, которую всё равно читают мельком.
 * Смысл здесь несут имя пакета и перечисление виджетов, а они и так
 * на латинице.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b0f1a",
          color: "#e5e9f2",
          fontFamily: "sans-serif",
        }}
      >
        {/* Пятно акцента в углу — та же аврора, что на лендинге */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -120,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(99,102,241,0.45), rgba(11,15,26,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="0.55" stopColor="#a855f7" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="url(#g)" />
            <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M16 25v-8" />
              <path d="M16 17c0-3.7 1.8-5.5 5.5-6.2" />
              <path d="M16 17c0-3.7-1.8-5.5-5.5-6.2" />
              <circle cx="22" cy="9.5" r="2.4" />
              <circle cx="10" cy="9.5" r="2.4" />
            </g>
            <circle cx="16" cy="25" r="1.9" fill="#fff" />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
            PathLogs UI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Kanban · Gantt · Filters
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#8a94ab", maxWidth: 860 }}>
            Design tokens, behavioural hooks and heavy widgets for React
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: 12,
              border: "1px solid #243049",
              background: "#111827",
              fontSize: 24,
              color: "#8a94ab",
            }}
          >
            npm i @toimetdev/pathlogs-core
          </div>
        </div>
      </div>
    ),
    size
  );
}
