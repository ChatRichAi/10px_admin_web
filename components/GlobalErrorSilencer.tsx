"use client";
import { useEffect } from "react";

export default function GlobalErrorSilencer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('createElementNS')) {
          e.preventDefault();
          return false;
        }
      });
      window.addEventListener('unhandledrejection', (e) => {
        if (e.reason && String(e.reason).includes('createElementNS')) {
          e.preventDefault();
          return false;
        }
      });
    }
  }, []);
  return null;
} 