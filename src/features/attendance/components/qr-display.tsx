import { useMemo } from "react";
import { motion } from "framer-motion";
import { generateQrMatrix } from "../qr-generator";

interface QrDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QrDisplay({ value, size = 180, className = "" }: QrDisplayProps) {
  const matrix = useMemo(() => generateQrMatrix(value, 25), [value]);
  const cellSize = size / matrix.length;

  return (
    <div className={`relative flex items-center justify-center p-2 bg-white rounded-2xl shadow-md ${className}`}>
      <motion.svg
        key={value}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
      >
        {matrix.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.4}
                height={cellSize + 0.4}
                rx={cellSize * 0.18}
                className="fill-slate-950"
              />
            );
          }),
        )}
      </motion.svg>
    </div>
  );
}
