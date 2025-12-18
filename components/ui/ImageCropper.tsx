import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface Props {
  imageSrc: string;
  aspectRatio: number; // e.g., 1 for square, 0.8 for passport
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<Props> = ({ imageSrc, aspectRatio, onCrop, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous"; // Handle cross-origin images if necessary
    img.onload = () => {
      setImage(img);
      setPosition({ x: 0, y: 0 });
      setScale(1);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed Crop Area Size (Screen Logic)
    const cropWidth = 300;
    const cropHeight = 300 / aspectRatio;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Clear canvas (preserve transparency)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();

  }, [image, scale, position, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    if (canvasRef.current) {
      // Use PNG to preserve transparency (important for AI BG removal)
      onCrop(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-lg flex flex-col items-center animate-fade-in-down border border-surfaceElevated shadow-2xl">
        <div className="flex justify-between w-full mb-4 items-center">
            <h3 className="text-xl font-bold text-white">Adjust Photo</h3>
            <button onClick={onCancel} className="p-2 hover:bg-surfaceElevated rounded-full text-slate-400 hover:text-white transition-all"><X size={20}/></button>
        </div>

        <div className="text-sm text-slate-400 mb-4">Drag to position, use slider to zoom.</div>

        <div className="relative border-4 border-accentAll rounded-lg overflow-hidden cursor-move mb-6 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-gray-800"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
             {/* Checkerboard background for transparency reference */}
             <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
                  style={{backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'}}>
             </div>

             <canvas ref={canvasRef} className="block relative z-10" />
             
             <div className="absolute top-2 right-2 bg-black/60 text-white text-xs p-1.5 rounded pointer-events-none z-20 flex items-center gap-1 backdrop-blur-sm">
                <Move className="w-3 h-3" /> Drag
             </div>
        </div>

        <div className="flex items-center gap-4 w-full mb-8 bg-primary/50 p-3 rounded-xl border border-surfaceElevated">
            <ZoomOut className="w-5 h-5 text-slate-400" />
            <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-accentAll h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex gap-4 w-full">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all">
                Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-accentAll text-black font-bold hover:bg-orange-500 flex items-center justify-center gap-2 shadow-lg shadow-accentAll/20 transition-all">
                <Check className="w-5 h-5" /> Save Crop
            </button>
        </div>
      </div>
    </div>
  );
};