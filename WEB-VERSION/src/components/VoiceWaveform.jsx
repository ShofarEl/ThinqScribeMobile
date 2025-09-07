import React, { useEffect, useMemo, useRef, useState } from 'react';

// Lightweight waveform renderer using Web Audio API
// Props: src (string URL), height (px), barWidth (px), gap (px), barColor
const VoiceWaveform = ({
  src,
  height = 36,
  barWidth = 2,
  gap = 1,
  barColor = '#4b5563',
}) => {
  const canvasRef = useRef(null);
  const [peaks, setPeaks] = useState([]);

  useEffect(() => {
    let aborted = false;
    const fetchAndDecode = async () => {
      try {
        const response = await fetch(src, { mode: 'cors' });
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0);
        const sampleSize = Math.floor(rawData.length / 120);
        const nextPeaks = [];
        for (let i = 0; i < 120; i++) {
          const start = i * sampleSize;
          const end = Math.min(start + sampleSize, rawData.length);
          let min = 1.0;
          let max = -1.0;
          for (let j = start; j < end; j++) {
            const val = rawData[j];
            if (val < min) min = val;
            if (val > max) max = val;
          }
          nextPeaks.push(Math.max(Math.abs(min), Math.abs(max)));
        }
        if (!aborted) setPeaks(nextPeaks);
      } catch (e) {
        // Fail silently; waveform is optional
        console.warn('Waveform decode failed:', e);
      }
    };
    if (src) fetchAndDecode();
    return () => { aborted = true; };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, width, h);
    ctx.fillStyle = barColor;

    const maxPeak = Math.max(0.01, ...peaks);
    const totalBars = Math.floor(width / (barWidth + gap));
    const step = Math.max(1, Math.floor(peaks.length / totalBars));

    let x = 0;
    for (let i = 0; i < peaks.length; i += step) {
      const value = peaks[i] / maxPeak;
      const barHeight = Math.max(2, Math.floor(value * h));
      const y = Math.floor((h - barHeight) / 2);
      ctx.fillRect(x, y, barWidth, barHeight);
      x += barWidth + gap;
      if (x > width) break;
    }
  }, [peaks, barWidth, gap, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={height}
      style={{ width: 240, height, display: 'block', opacity: 0.9 }}
    />
  );
};

export default VoiceWaveform;


