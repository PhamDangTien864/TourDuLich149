"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Payment() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setSuccess(true);

    setTimeout(() => {
      router.push("/history");
    }, 2000);
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "60px auto",
        padding: "40px 30px",
        backgroundColor: "#f0f4f8",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "2.5rem", marginBottom: "30px", color: "#222" }}>
        Thanh toán
      </h2>

      {!success ? (
        <button
          onClick={handlePayment}
          style={{
            padding: "18px 50px",
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#fff",
            backgroundColor: "#0070f3",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#005bb5")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0070f3")}
        >
          Thanh toán ngay
        </button>
      ) : (
        <div
          style={{
            color: "#2d8659",
            fontSize: "1.4rem",
            marginTop: "20px",
            fontWeight: "600",
          }}
        >
          Thanh toán thành công!
        </div>
      )}
    </div>
  );
}