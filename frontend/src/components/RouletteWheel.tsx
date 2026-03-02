"use client";

import { useRef, useEffect, useCallback } from "react";

interface RouletteWheelProps {
  items: string[];
  onResult: (item: string) => void;
  spinning: boolean;
  onSpin: () => void;
}

const SEGMENT_COLORS = [
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#22C55E", // green-500
  "#06B6D4", // cyan-500
  "#3B82F6", // blue-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
];

export default function RouletteWheel({
  items,
  onResult,
  spinning,
  onSpin,
}: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentRotation = useRef(0);
  const animationRef = useRef<number | null>(null);
  const hasCalledResult = useRef(false);

  const segmentAngle = (2 * Math.PI) / items.length;

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 8;

      ctx.clearRect(0, 0, size, size);

      // Draw segments
      items.forEach((item, i) => {
        const startAngle = rotation + i * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        ctx.fill();

        // Segment border
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(center, center);
        const textAngle = startAngle + segmentAngle / 2;
        ctx.rotate(textAngle);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${size < 280 ? 11 : 13}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Position text at ~60% of radius
        const textRadius = radius * 0.6;
        const text = item.length > 8 ? item.slice(0, 7) + "…" : item;
        ctx.fillText(text, textRadius, 0);

        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 20, 0, 2 * Math.PI);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Outer ring
      ctx.beginPath();
      ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 4;
      ctx.stroke();
    },
    [items, segmentAngle]
  );

  // Initial draw
  useEffect(() => {
    drawWheel(currentRotation.current);
  }, [drawWheel]);

  // Spinning animation
  useEffect(() => {
    if (!spinning) return;

    hasCalledResult.current = false;

    const duration = 3000; // 3 seconds
    const startTime = performance.now();
    // Random target: at least 5 full rotations + random offset
    const extraRotations = 5 + Math.random() * 3;
    const targetAngle =
      currentRotation.current + extraRotations * 2 * Math.PI;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const newRotation =
        currentRotation.current +
        (targetAngle - currentRotation.current) * easedProgress;

      drawWheel(newRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation done
        currentRotation.current = newRotation % (2 * Math.PI);

        if (!hasCalledResult.current) {
          hasCalledResult.current = true;

          // Determine which segment the pointer (top center) points at
          // The pointer is at the top (angle = -PI/2 = 3PI/2)
          // We need to find which segment is at that position
          const normalizedRotation =
            ((currentRotation.current % (2 * Math.PI)) + 2 * Math.PI) %
            (2 * Math.PI);
          // The pointer is at 0 (top). Each segment starts at rotation + i*segAngle - PI/2
          // So segment i is at top when: rotation + i*segAngle - PI/2 ≡ 0 (mod 2PI)
          // i*segAngle ≡ PI/2 - rotation (mod 2PI)
          // But simpler: top angle in wheel coordinates is -rotation + 0 (since we draw with offset)
          // Actually the top of the wheel corresponds to angle = -PI/2 in canvas coords
          // At that angle, the segment is: (-PI/2 - rotation + PI/2) / segAngle
          // = -rotation / segAngle
          const pointerAngle =
            ((-normalizedRotation % (2 * Math.PI)) + 2 * Math.PI) %
            (2 * Math.PI);
          const selectedIndex =
            Math.floor(pointerAngle / segmentAngle) % items.length;

          onResult(items[selectedIndex]);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spinning, drawWheel, items, onResult, segmentAngle]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pointer indicator */}
      <div className="relative w-full max-w-[300px]">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "20px solid #1f2937",
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="mx-auto mt-4 h-auto w-full max-w-[300px] rounded-full"
        />
      </div>

      <button
        onClick={onSpin}
        disabled={spinning}
        className="rounded-lg bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        {spinning ? "돌리는 중..." : "룰렛 돌리기"}
      </button>
    </div>
  );
}
