import React, { useState, useEffect, useRef } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  const canvasRef = useRef(null);
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;

      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [isLandscape]);

  const mobileToolbarHeight = 96; // スマホ下部バー全体の高さ
  const mobileBottomGap = 12; // 下に少し空ける隙間

  const styles = {
    container: {
      display: "flex",
      flexDirection: isLandscape ? "row" : "column",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#E5E5E5",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    },

    // PCでは左余白、スマホでは不要
    marginFirst: {
      display: isLandscape ? "block" : "none",
      flex: "0 0 15%",
      backgroundColor: "#D1D1D1",
    },

    // 残り全部をキャンバスに使う
    canvasMain: {
      flex: isLandscape ? "0 0 70%" : "1 1 auto",
      minHeight: 0,
      backgroundColor: "#BCBCBC",
      padding: isLandscape ? "40px 20px" : "12px 12px 0 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxSizing: "border-box",
    },

    whitePaper: {
      width: "100%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      position: "relative",
      minHeight: 0,
    },

    // PCでは右余白、スマホでは下部ツールバーエリア
    marginSecond: {
      flex: isLandscape ? "0 0 15%" : `0 0 ${mobileToolbarHeight}px`,
      backgroundColor: "#D1D1D1",
      display: "flex",
      justifyContent: "center",
      alignItems: isLandscape ? "center" : "flex-start",
      padding: isLandscape ? "0" : `${mobileBottomGap}px 16px 12px`,
      boxSizing: "border-box",
    },

    // PCでは縦、スマホでは横
    greenBar: {
      display: "flex",
      flexDirection: isLandscape ? "column" : "row",
      backgroundColor: "#00FFAB",
      padding: isLandscape ? "24px 16px" : "12px 18px",
      gap: isLandscape ? "32px" : "20px",
      borderRadius: "8px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
      width: isLandscape ? "auto" : "100%",
      maxWidth: isLandscape ? "none" : "320px",
      justifyContent: "space-between",
      alignItems: "center",
    },

    canvas: {
      width: "100%",
      height: "100%",
      display: "block",
      cursor: "crosshair",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.marginFirst}></div>

      <div style={styles.canvasMain}>
        <div style={styles.whitePaper}>
          <canvas ref={canvasRef} style={styles.canvas} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "20px solid rgba(0,0,0,0.03)",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={styles.marginSecond}>
        <div style={styles.greenBar}>
          <ToolbarButton icon={<Pencil size={28} />} />
          <ToolbarButton icon={<Eraser size={28} />} />
          <ToolbarButton icon={<Layers size={28} />} />
          <ToolbarButton icon={<Undo2 size={28} />} />
          <ToolbarButton icon={<PaintBucket size={28} />} />
        </div>
      </div>
    </div>
  );
}

const ToolbarButton = ({ icon }) => (
  <button
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      color: "#000",
      transition: "transform 0.1s",
    }}
    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    {icon}
  </button>
);

export default App;
