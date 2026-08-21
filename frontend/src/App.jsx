import { useState, useCallback } from "react";

const API_URL = "http://localhost:5000";

function BrainScanIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="26" rx="16" ry="14" stroke="#00f5d4" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M12 22c0-8 5-14 12-14s12 6 12 14" stroke="#00f5d4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M18 14c-2 2-3 5-3 8" stroke="#00f5d4" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M24 10v4M20 26c0 2 1.5 4 4 4s4-2 4-4-1.5-4-4-4-4 2-4 4z" stroke="#00f5d4" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <circle cx="24" cy="26" r="2" fill="#00f5d4" opacity="0.8"/>
      <path d="M8 28h4M36 28h4M24 40v4" stroke="#00f5d4" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4L16 22M16 4L10 10M16 4L22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 24h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ResultCard({ result }) {
  const isTumor = result.predicted_class === 1;
  return (
    <div style={{
      background: isTumor
        ? "linear-gradient(135deg, rgba(255,50,50,0.08) 0%, rgba(255,50,50,0.02) 100%)"
        : "linear-gradient(135deg, rgba(0,245,212,0.08) 0%, rgba(0,245,212,0.02) 100%)",
      border: `1px solid ${isTumor ? "rgba(255,80,80,0.4)" : "rgba(0,245,212,0.4)"}`,
      borderRadius: "16px",
      padding: "28px",
      marginTop: "24px",
      animation: "fadeSlideUp 0.5s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: isTumor ? "rgba(255,80,80,0.15)" : "rgba(0,245,212,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px"
        }}>
          {isTumor ? "⚠️" : "✅"}
        </div>
        <div>
          <div style={{
            fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
            color: isTumor ? "rgba(255,120,120,0.7)" : "rgba(0,245,212,0.7)",
            marginBottom: "4px", fontFamily: "'Space Mono', monospace"
          }}>
            Diagnosis Result
          </div>
          <div style={{
            fontSize: "22px", fontWeight: "700",
            color: isTumor ? "#ff6464" : "#00f5d4",
            fontFamily: "'Space Mono', monospace", letterSpacing: "1px"
          }}>
            {result.label}
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", marginBottom: "8px",
          fontFamily: "'Space Mono', monospace"
        }}>
          <span>Confidence</span>
          <span>{result.confidence}%</span>
        </div>
        <div style={{
          height: "6px", background: "rgba(255,255,255,0.06)",
          borderRadius: "3px", overflow: "hidden"
        }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            width: `${result.confidence}%`,
            background: isTumor
              ? "linear-gradient(90deg, #ff3333, #ff6464)"
              : "linear-gradient(90deg, #00b4d8, #00f5d4)",
            transition: "width 1s ease",
            boxShadow: isTumor ? "0 0 12px rgba(255,80,80,0.5)" : "0 0 12px rgba(0,245,212,0.5)"
          }}/>
        </div>
      </div>

      {/* Cropped Image */}
      {result.cropped_image && (
        <div>
          <div style={{
            fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)", marginBottom: "10px",
            fontFamily: "'Space Mono', monospace"
          }}>
            Processed Region
          </div>
          <img
            src={`data:image/jpeg;base64,${result.cropped_image}`}
            alt="Cropped brain"
            style={{
              width: "100%", maxHeight: "200px", objectFit: "contain",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)",
              filter: "contrast(1.1) brightness(1.05)"
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handlePredict = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await fetch(`${API_URL}/predict`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not connect to backend. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8eaf0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #00f5d4; border-radius: 2px; }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,212,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,212,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none"
      }}/>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "560px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px", animation: "fadeSlideUp 0.6s ease" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "rgba(0,245,212,0.06)",
              border: "1px solid rgba(0,245,212,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(0,245,212,0.08)"
            }}>
              <BrainScanIcon />
            </div>
          </div>
          <div style={{
            fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase",
            color: "#00f5d4", marginBottom: "10px",
            fontFamily: "'Space Mono', monospace"
          }}>
            Neural Diagnostic System
          </div>
          <h1 style={{
            fontSize: "32px", fontWeight: "600", lineHeight: 1.2,
            color: "#ffffff", marginBottom: "10px", letterSpacing: "-0.5px"
          }}>
            Brain Tumor<br />
            <span style={{ color: "#00f5d4" }}>Detection</span>
          </h1>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.35)",
            lineHeight: 1.6, maxWidth: "340px", margin: "0 auto"
          }}>
            VGG16 transfer learning model trained on brain MRI scans. Upload an image for instant analysis.
          </p>
        </div>

        {/* Upload Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${dragging ? "rgba(0,245,212,0.6)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "20px", padding: "24px",
          animation: "fadeSlideUp 0.7s ease",
          transition: "border-color 0.2s",
          boxShadow: dragging ? "0 0 30px rgba(0,245,212,0.1)" : "none"
        }}>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
            style={{
              border: `1.5px dashed ${dragging ? "rgba(0,245,212,0.8)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px",
              padding: preview ? "16px" : "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: dragging ? "rgba(0,245,212,0.03)" : "transparent",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {preview ? (
              <div style={{ position: "relative" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxHeight: "240px", maxWidth: "100%",
                    borderRadius: "8px", objectFit: "contain",
                    filter: "brightness(0.95)"
                  }}
                />
                {/* Scanline effect */}
                <div style={{
                  position: "absolute", left: 0, right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(0,245,212,0.6), transparent)",
                  animation: "scanline 2s linear infinite",
                  pointerEvents: "none"
                }}/>
                <div style={{
                  marginTop: "12px", fontSize: "12px",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {image?.name} · Click to change
                </div>
              </div>
            ) : (
              <>
                <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: "12px" }}>
                  <UploadIcon />
                </div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" }}>
                  Drop MRI image here
                </div>
                <div style={{
                  fontSize: "12px", color: "rgba(255,255,255,0.25)",
                  fontFamily: "'Space Mono', monospace"
                }}>
                  or click to browse — JPG, PNG
                </div>
              </>
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: "none" }}
            />
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={!image || loading}
            style={{
              width: "100%", marginTop: "16px",
              padding: "14px",
              background: image && !loading
                ? "linear-gradient(135deg, #00b4d8, #00f5d4)"
                : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: "10px",
              color: image && !loading ? "#080c14" : "rgba(255,255,255,0.2)",
              fontSize: "14px", fontWeight: "600",
              letterSpacing: "1px", textTransform: "uppercase",
              cursor: image && !loading ? "pointer" : "not-allowed",
              fontFamily: "'Space Mono', monospace",
              transition: "all 0.2s",
              boxShadow: image && !loading ? "0 0 24px rgba(0,245,212,0.3)" : "none",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "10px"
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.2)",
                  borderTop: "2px solid #00f5d4", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}/>
                Analyzing...
              </>
            ) : "Run Analysis"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "16px", padding: "14px 18px",
            background: "rgba(255,80,80,0.06)",
            border: "1px solid rgba(255,80,80,0.2)",
            borderRadius: "10px", fontSize: "13px",
            color: "#ff8080", fontFamily: "'Space Mono', monospace",
            animation: "fadeSlideUp 0.3s ease"
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} />}

        {/* Footer */}
        <div style={{
          textAlign: "center", marginTop: "40px",
          fontSize: "11px", color: "rgba(255,255,255,0.15)",
          fontFamily: "'Space Mono', monospace", letterSpacing: "1px"
        }}>
          VGG16 · Transfer Learning · 98% Val Accuracy
        </div>
      </div>
    </div>
  );
}
