import React, { useRef, useState } from "react";
import { Paperclip, X, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";
import { fileToBase64 } from "../services/storage";
import { Btn } from "./Primitives";

export default function FileUpload({ onUpload, accept = "*/*", label = "Upload File", t }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // limit to 5MB for storage safety
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max size is 5MB.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
      });
      onUpload({
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
      });
    } catch (err) {
      setError("Failed to process file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onUpload(null);
  };

  const isImage = uploadedFile?.type.startsWith("image/");

  return (
    <div style={{ marginBottom: 12 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: "none" }}
      />

      {!uploadedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            padding: "16px",
            border: `1px dashed ${t.line}`,
            borderRadius: 8,
            background: t.canvas,
            color: t.inkSoft,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            outline: "none",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = t.primary)}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = t.line)}
        >
          {loading ? (
            <span style={{ fontSize: 13, fontFamily: "Inter" }}>Processing...</span>
          ) : (
            <>
              <Paperclip size={18} color={t.primary} />
              <span style={{ fontSize: 13, fontFamily: "Inter", fontWeight: 500, color: t.ink }}>
                {label}
              </span>
              <span style={{ fontSize: 11, fontFamily: "Inter" }}>
                Supports files up to 5MB
              </span>
            </>
          )}
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            border: `1px solid ${t.line}`,
            borderRadius: 8,
            background: t.surface,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {isImage ? (
              <ImageIcon size={18} color={t.primary} style={{ flexShrink: 0 }} />
            ) : (
              <FileText size={18} color={t.gold} style={{ flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  color: t.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {uploadedFile.name}
              </div>
              <div style={{ fontSize: 11, fontFamily: "Inter", color: t.inkSoft }}>
                {uploadedFile.size}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.coral,
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: 12,
            fontFamily: "Inter",
            color: t.coral,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
