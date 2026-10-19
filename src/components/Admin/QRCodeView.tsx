import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { StallSettings } from '../../types';
import { BrandLogo } from '../BrandLogo';

interface QRCodeViewProps {
  settings: StallSettings;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({ settings }) => {
  const [menuUrl, setMenuUrl] = useState('');
  const [qrPngUrl, setQrPngUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate public menu URL (without admin query/hash)
    const url = window.location.origin + window.location.pathname;
    setMenuUrl(url);

    // Generate high resolution 1024x1024 PNG QR code
    QRCode.toDataURL(url, {
      width: 1024,
      margin: 2,
      color: {
        dark: '#141416',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(dataUrl => setQrPngUrl(dataUrl))
      .catch(err => console.error('Failed to generate high-res QR', err));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!qrPngUrl) return;
    const a = document.createElement('a');
    a.href = qrPngUrl;
    a.download = `tasty_food_court_qr_porbandar_2026.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-display font-bold text-lg">
            Exhibition Stall QR Code & Table Standee
          </h2>
          <p className="text-neutral-400 text-xs">
            Permanent QR code for customer table scanning at Navy Children's School Porbandar Exhibition 2026.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadPNG}
            className="px-3.5 py-2 bg-[#FF6A00] hover:bg-[#E05200] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download High-Res PNG</span>
          </button>

          <button
            onClick={handlePrintPoster}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-neutral-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Stall Poster</span>
          </button>
        </div>
      </div>

      {/* Main Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: URL details & instructions */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Link Card */}
          <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-400 block">
              Permanent Customer Menu URL
            </span>

            <div className="p-3 bg-black/50 rounded-xl border border-neutral-800 font-mono text-xs text-white break-all flex items-center justify-between gap-2">
              <span className="truncate">{menuUrl}</span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-1">
              <a
                href={menuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#FF6A00] hover:underline font-semibold"
              >
                <span>Open Customer Menu in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Exhibition Stall Guidelines */}
          <div className="bg-[#1A1A1E] p-5 rounded-2xl border border-neutral-800 space-y-2.5 text-xs text-neutral-300">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF6A00]" />
              Stall Exhibition Instructions
            </h4>
            <ul className="space-y-1.5 text-neutral-400 list-disc list-inside leading-relaxed">
              <li>Print 5-10 copies of this poster for dining tables and the stall front counter.</li>
              <li>Customers point their phone camera to instantly open the live digital menu without downloading any app.</li>
              <li>When items are marked sold out or prices are adjusted on this laptop, the QR code continues to work seamlessly without reprinting!</li>
            </ul>
          </div>

        </div>

        {/* Right Side: Visual Standee Poster Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            ref={posterRef}
            className="w-full max-w-sm bg-[#FAF7F2] text-[#141416] p-7 rounded-3xl border-4 border-[#141416] shadow-2xl flex flex-col items-center text-center relative"
          >
            {/* Top Exhibition Badge */}
            <div className="text-[10px] font-black tracking-widest uppercase bg-[#141416] text-amber-300 px-3 py-1 rounded-full mb-4">
              Navy Children's School Porbandar · Exhibition 2026
            </div>

            {/* Brand Logo & Tagline */}
            <BrandLogo size="lg" showTagline={true} className="justify-center" />

            <div className="w-12 h-0.5 bg-[#FF6A00] my-4 rounded-full" />

            {/* Headline Call to Action */}
            <h3 className="font-display font-extrabold text-xl text-[#141416] leading-tight">
              SCAN TO ORDER
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5 font-medium">
              Browse Menu & Pay from Your Table
            </p>

            {/* High Resolution QR Box */}
            <div className="p-4 bg-white rounded-2xl border-2 border-neutral-300 shadow-md my-5">
              {qrPngUrl ? (
                <img
                  src={qrPngUrl}
                  alt="Tasty Food Court Menu QR Code"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Highlights Strip */}
            <div className="text-[11px] font-semibold text-neutral-700 space-y-1 mb-3">
              <div>🍕 Fresh Hot Pizzas · 🥤 Signature Oreo Shakes · 🥟 Golden Puffs & Bhel</div>
              <div className="text-[#FF6A00] font-bold">Fast UPI Payment · Instant Counter Pickup</div>
            </div>

            {/* Stall Number Banner */}
            <div className="w-full py-2 bg-[#141416] text-white rounded-xl text-xs font-bold tracking-wider uppercase mt-2">
              Stall #4 · Tasty Food Court
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
