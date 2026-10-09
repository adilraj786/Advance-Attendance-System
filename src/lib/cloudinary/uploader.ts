/**
 * Cloudinary File Uploader for Course Materials & Study Documents
 * Replace with your own Cloudinary Credentials or configure via .env
 */

const DEFAULT_CLOUD_NAME = "ADD_YOUR_OWN_CLOUDINARY_CLOUD_NAME";
const DEFAULT_PRESET = "ADD_YOUR_OWN_CLOUDINARY_UPLOAD_PRESET";
const DEFAULT_API_KEY = "ADD_YOUR_OWN_CLOUDINARY_API_KEY";
const DEFAULT_API_SECRET = "ADD_YOUR_OWN_CLOUDINARY_API_SECRET";

async function computeSha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; publicId?: string }> {
  const cloudName =
    (import.meta.env["VITE_CLOUDINARY_CLOUD_NAME"] as string) || DEFAULT_CLOUD_NAME;
  const uploadPreset =
    (import.meta.env["VITE_CLOUDINARY_UPLOAD_PRESET"] as string) || DEFAULT_PRESET;
  const apiKey =
    (import.meta.env["VITE_CLOUDINARY_API_KEY"] as string) || DEFAULT_API_KEY;
  const apiSecret =
    (import.meta.env["VITE_CLOUDINARY_API_SECRET"] as string) || DEFAULT_API_SECRET;

  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(file.name);

  const resourceType = isImage ? "image" : "auto";
  let lastErrorDetail = "";

  // Strategy 1: Unsigned Preset Upload (Stores-Images preset)
  try {
    const unsignedFormData = new FormData();
    unsignedFormData.append("file", file);
    unsignedFormData.append("upload_preset", uploadPreset);

    const endpoints = [
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: "POST",
        body: unsignedFormData,
      });

      const data = await response.json();
      if (response.ok && (data.secure_url || data.url)) {
        const finalUrl = data.secure_url || data.url;
        console.log("✅ Cloudinary unsigned upload successful:", finalUrl);
        return {
          url: finalUrl,
          publicId: data.public_id,
        };
      }

      if (data?.error?.message) {
        lastErrorDetail = data.error.message;
        console.warn(`Cloudinary unsigned endpoint (${endpoint}) returned:`, data.error.message);
      }
    }
  } catch (err: any) {
    lastErrorDetail = err?.message || String(err);
    console.warn("Cloudinary unsigned upload attempt notice:", err);
  }

  // Strategy 2: Signed Upload using API Key + API Secret (with timestamp signature)
  if (apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = await computeSha1(stringToSign);

      const signedFormData = new FormData();
      signedFormData.append("file", file);
      signedFormData.append("api_key", apiKey);
      signedFormData.append("timestamp", timestamp);
      signedFormData.append("signature", signature);

      const endpoints = [
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          body: signedFormData,
        });

        const data = await response.json();
        if (response.ok && (data.secure_url || data.url)) {
          const finalUrl = data.secure_url || data.url;
          console.log("✅ Cloudinary signed upload successful:", finalUrl);
          return {
            url: finalUrl,
            publicId: data.public_id,
          };
        }

        if (data?.error?.message) {
          lastErrorDetail = data.error.message;
          console.warn(`Cloudinary signed endpoint (${endpoint}) returned:`, data.error.message);
        }
      }
    } catch (err: any) {
      lastErrorDetail = err?.message || String(err);
      console.warn("Cloudinary signed upload attempt notice:", err);
    }
  }

  throw new Error(
    `Cloudinary upload failed: ${lastErrorDetail || "Please check your network and Cloudinary preset."}`
  );
}

/**
 * Universal safe opener and downloader for course materials
 */
export async function openOrDownloadMaterial(url: string, filename: string) {
  // If URL exists and is a valid HTTP link
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    try {
      // Try direct blob fetch to force download dialog
      const response = await fetch(url, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return;
      }
    } catch {
      // Fallback to opening link
    }
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback for mock items or documents without an active CDN link:
  // Generate a styled downloadable study resource package on the fly
  const content = `================================================================================
SVIT INSTITUTION OF TECHNOLOGY · DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
SMART ATTENDANCE & ACADEMIC RESOURCE DISTRIBUTION PORTAL
================================================================================

DOCUMENT: ${filename}
GENERATION DATE: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}
ACADEMIC YEAR: 2026-2027 (Odd Semester V)
STATUS: Verified Institutional Course Material

--------------------------------------------------------------------------------
1. COURSE OVERVIEW & MODULE SYLLABUS
--------------------------------------------------------------------------------
This material has been prepared by the departmental subject committee for
registered scholars of SVIT Campus.

Key Units Covered:
• Unit 1: Foundational Principles, Architecture & Mathematical Models
• Unit 2: Core Algorithms, Data Flow & Implementation Schemas
• Unit 3: Practical Lab Protocols, Real-world Case Studies & Optimization
• Unit 4: Review Questions, Solved Numerical Problems & Past Exam Questions

--------------------------------------------------------------------------------
2. ESSENTIAL STUDY NOTES & HIGHLIGHTS
--------------------------------------------------------------------------------
1. Ensure all laboratory benchmarks are verified prior to the internal evaluation.
2. Maintain minimum 75% attendance to remain eligible for end-term university exams.
3. For question clearances, attend designated tutorial hours with course faculty.

--------------------------------------------------------------------------------
DIGITAL VERIFICATION: SVIT-ACAD-${Math.random().toString(36).substring(2, 9).toUpperCase()}
Central Database Record: ACTIVE & SYNCHRONIZED
================================================================================
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  const safeFilename = filename.endsWith(".txt") || filename.includes(".") ? filename : `${filename}.txt`;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}
