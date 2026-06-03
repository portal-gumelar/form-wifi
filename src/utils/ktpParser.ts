export interface ParsedKTP {
  nik?: string;
  nama?: string;
  alamat?: string;
  rt?: string;
  rw?: string;
  desa?: string;
  kecamatan?: string;
}

import { VILLAGES } from "../constants/villages";

const formatToTwoDigits = (numStr: string): string => {
  const clean = numStr.replace(/\D/g, "");
  if (!clean) return "";
  const num = parseInt(clean, 10);
  return String(num).padStart(2, "0");
};

const extractValue = (line: string, labelKeywords: string[]): string => {
  const upperLine = line.toUpperCase();
  let foundKeyword = "";
  
  for (const keyword of labelKeywords) {
    const idx = upperLine.indexOf(keyword.toUpperCase());
    if (idx !== -1) {
      foundKeyword = line.substring(idx, idx + keyword.length);
      break;
    }
  }
  
  if (!foundKeyword) return "";
  
  const idx = line.indexOf(foundKeyword);
  const afterKeyword = line.substring(idx + foundKeyword.length).trim();
  
  // Clean leading colons, semicolons, hyphens, pipes, or common OCR misreads of colons
  return afterKeyword.replace(/^[:;=\-\s|i1!]+/, "").trim();
};

export const parseKTPText = (text: string): ParsedKTP => {
  const lines = text.split("\n");
  const result: ParsedKTP = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const upperLine = line.toUpperCase();

    // 0. Extract NIK
    if ((upperLine.includes("nik") || upperLine.includes("N1K") || upperLine.includes("M|K")) && !result.nik) {
      const cleanLine = upperLine.replace(/\s+/g, '');
      const nikMatch = cleanLine.match(/(\d{16})/);
      if (nikMatch) {
        result.nik = nikMatch[1];
      }
    }

    // 1. Extract Nama
    if ((upperLine.includes("NAMA") || upperLine.includes("NEMA") || upperLine.includes("NANA")) && !result.nama) {
      const val = extractValue(line, ["Nama", "Nema", "Nana"]);
      if (val && val.length > 2) {
        result.nama = val;
      }
    }

    // 2. Extract Alamat
    if ((upperLine.includes("ALAMAT") || upperLine.includes("ALAMAI") || upperLine.includes("ALAMT")) && !result.alamat) {
      const val = extractValue(line, ["Alamat", "Alamai", "Alamt"]);
      if (val) {
        result.alamat = val;
      }
    }

    // 3. Extract RT/RW
    if (
      (upperLine.includes("RT/RW") || upperLine.includes("RT / RW") || upperLine.includes("RT/ RW") || upperLine.includes("RT/RW")) &&
      (!result.rt || !result.rw)
    ) {
      const rtRwMatch = line.match(/(\d{1,3})\s*[\/|1lI]\s*(\d{1,3})/);
      if (rtRwMatch) {
        const rtNum = formatToTwoDigits(rtRwMatch[1]);
        const rwNum = formatToTwoDigits(rtRwMatch[2]);
        if (rtNum) result.rt = `RT ${rtNum}`;
        if (rwNum) result.rw = `RW ${rwNum}`;
      }
    } else {
      // Fallback: search for standalone RT and RW on the line
      const rtMatch = line.match(/RT\s*[:;i|l1!\s]?\s*(\d{1,3})/i);
      const rwMatch = line.match(/RW\s*[:;i|l1!\s]?\s*(\d{1,3})/i);
      if (rtMatch && !result.rt) {
        const rtNum = formatToTwoDigits(rtMatch[1]);
        if (rtNum) result.rt = `RT ${rtNum}`;
      }
      if (rwMatch && !result.rw) {
        const rwNum = formatToTwoDigits(rwMatch[1]);
        if (rwNum) result.rw = `RW ${rwNum}`;
      }
    }

    // 4. Extract Kel/Desa
    if ((upperLine.includes("KEL/DESA") || upperLine.includes("KEL") || upperLine.includes("DESA")) && !result.desa) {
      let val = extractValue(line, ["Kel/Desa", "Kelur", "desa", "Kel"]);
      if (val) {
        val = val.toUpperCase().trim();
        // Match against standard covered villages
        for (const v of VILLAGES) {
          if (val.includes(v) || v.includes(val)) {
            result.desa = v;
            break;
          }
        }
        if (!result.desa && val.length > 2) {
          result.desa = val;
        }
      }
    }

    // 5. Extract Kecamatan
    if ((upperLine.includes("KECAMATAN") || upperLine.includes("KEC")) && !result.kecamatan) {
      const val = extractValue(line, ["kecamatan", "Kec"]);
      if (val && val.length > 2) {
        result.kecamatan = val.toUpperCase();
      }
    }
  }

  // Fallback for RT/rw: if RT/RW line didn't match, search entire text for "RT 0X" or "RW 0X" style patterns
  if (!result.rt || !result.rw) {
    const fullText = text.toUpperCase();
    const rtMatch = fullText.match(/RT[\s\.]*(\d{1,3})/);
    const rwMatch = fullText.match(/RW[\s\.]*(\d{1,3})/);
    if (rtMatch && !result.rt) {
      const rtNum = formatToTwoDigits(rtMatch[1]);
      if (rtNum) result.rt = `RT ${rtNum}`;
    }
    if (rwMatch && !result.rw) {
      const rwNum = formatToTwoDigits(rwMatch[1]);
      if (rwNum) result.rw = `RW ${rwNum}`;
    }
  }

  // Fallback for NIK
  if (!result.nik) {
    const cleanText = text.replace(/\s+/g, '');
    const nikMatch = cleanText.match(/(\d{16})/);
    if (nikMatch) {
      result.nik = nikMatch[1];
    }
  }

  return result;
};
