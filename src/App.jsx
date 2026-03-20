import React, { useState, useEffect, useRef } from "react";
import { Pencil, Eraser, Layers, Undo2, PaintBucket } from "lucide-react";

function App() {
  const canvasRef = useRef(null);
  // 画面の「横幅」が「高さ」より大きい場合に Landscape（横長モード）とする
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);

      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent) {
        // キャンバスの解像度を親要素に合わせる
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLandscape]);

  // --- スタイル定義（PCの大画面でも崩れない設定） ---
  const styles = {
    container: {
      display: "flex",
      // 横長なら横並び(row)、縦長なら縦並び(column)
      flexDirection: isLandscape ? "row" : "column",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#E5E5E5",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    },
    // 【左側】のグレー余白：PCでは幅を広めに取る
    marginFirst: {
      flex: isLandscape ? "0 0 15%" : "0 0 10%",
      backgroundColor: "#D1D1D1",
    },
    // 【中央】白いキャンバス：上下に少し余白を作って「横長感」を出す
    canvasMain: {
      flex: isLandscape ? "0 0 70%" : "0 0 75%",
      backgroundColor: "#BCBCBC", // キャンバスの裏側を少し暗く
      padding: isLandscape ? "40px 20px" : "20px", // 上下に余白を作って横長に見せる
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    whitePaper: {
      width: "100%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      position: "relative",
    },
    // 【右側】のグレー余白 ＋ ツールバー
    marginSecond: {
      flex: isLandscape ? "0 0 15%" : "0 0 15%",
      backgroundColor: "#D1D1D1",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    // 緑のツールバー（アイコンを大きく、間隔を広く）
    greenBar: {
      display: "flex",
      flexDirection: isLandscape ? "column" : "row",
      backgroundColor: "#00FFAB",
      padding: "24px 16px", // ツールバー自体を大きく
      gap: "32px", // アイコン同士の間隔を広く
      borderRadius: "8px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
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
      {/* 1. 左または上の余白 */}
      <div style={styles.marginFirst}></div>

      {/* 2. 中央のキャンバスエリア */}
      <div style={styles.canvasMain}>
        <div style={styles.whitePaper}>
          <canvas ref={canvasRef} style={styles.canvas} />
          {/* 内側の装飾枠 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "20px solid rgba(0,0,0,0.03)",
              pointerEvents: "none",
            }}
          ></div>
        </div>
      </div>

      {/* 3. 右または下の余白 */}
      <div style={styles.marginSecond}>
        <div style={styles.greenBar}>
          {/* アイコンのサイズを 32 に大きくしました */}
          <ToolbarButton icon={<Pencil size={32} />} />
          <ToolbarButton icon={<Eraser size={32} />} />
          <ToolbarButton icon={<Layers size={32} />} />
          <ToolbarButton icon={<Undo2 size={32} />} />
          <ToolbarButton icon={<PaintBucket size={32} />} />
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
  >
    {icon}
  </button>
);

export default App;
