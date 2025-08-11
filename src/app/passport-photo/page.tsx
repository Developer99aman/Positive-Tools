'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Upload, Camera, Download, Loader2, CheckCircle, AlertCircle, Move, RotateCw, Crop, Palette, Type, SlidersHorizontal, Droplet, Sun, Moon, Paintbrush, Pipette, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

// Passport photo dimensions (35mm x 45mm at 300 DPI)
const PASSPORT_DIMENSIONS = {
  width: 413,
  height: 531,
  dpi: 300
};

// Utility functions
const generateSolidBackground = (width: number, height: number, color: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
};

const generateGradientBackground = (width: number, height: number, startColor: string, endColor: string, direction = 'vertical') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    let gradient;
    switch (direction) {
      case 'horizontal':
        gradient = ctx.createLinearGradient(0, 0, width, 0);
        break;
      case 'diagonal':
        gradient = ctx.createLinearGradient(0, 0, width, height);
        break;
      default:
        gradient = ctx.createLinearGradient(0, 0, 0, height);
    }
    
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas;
};

const downloadCanvasAsImage = (canvas: HTMLCanvasElement, filename = 'passport-photo.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 0.9);
  link.click();
};

// Manual Cropping Component
const ManualCropper = ({ image, onCropComplete, onCancel }: {
  image: HTMLImageElement;
  onCropComplete: (croppedCanvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 257 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState('');
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Calculate scale to fit image in canvas
      const maxWidth = 600;
      const maxHeight = 400;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      setImageScale(scale);
      
      // Initialize crop area to a reasonable default, centered
      const initialCropWidth = Math.min(200, canvas.width * 0.8);
      const initialCropHeight = initialCropWidth * (PASSPORT_DIMENSIONS.height / PASSPORT_DIMENSIONS.width);
      setCropArea({
        x: (canvas.width - initialCropWidth) / 2,
        y: (canvas.height - initialCropHeight) / 2,
        width: initialCropWidth,
        height: initialCropHeight
      });

      drawCanvas();
    }
  }, [image]);

  useEffect(() => {
    drawCanvas();
  }, [cropArea]);

  const drawCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Redraw image in crop area
    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;
    
    ctx.drawImage(
      image,
      cropArea.x * scaleX, cropArea.y * scaleY, cropArea.width * scaleX, cropArea.height * scaleY,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height
    );
    
    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Draw corner handles
    const handleSize = 16;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
  }, [image, cropArea]);

  const getHandle = (x: number, y: number) => {
    const handleSize = 16;
    if (x >= cropArea.x - handleSize && x <= cropArea.x + handleSize &&
        y >= cropArea.y - handleSize && y <= cropArea.y + handleSize) return 'nw';
    if (x >= cropArea.x + cropArea.width - handleSize && x <= cropArea.x + cropArea.width + handleSize &&
        y >= cropArea.y - handleSize && y <= cropArea.y + handleSize) return 'ne';
    if (x >= cropArea.x - handleSize && x <= cropArea.x + handleSize &&
        y >= cropArea.y + cropArea.height - handleSize && y <= cropArea.y + cropArea.height + handleSize) return 'sw';
    if (x >= cropArea.x + cropArea.width - handleSize && x <= cropArea.x + cropArea.width + handleSize &&
        y >= cropArea.y + cropArea.height - handleSize && y <= cropArea.y + cropArea.height + handleSize) return 'se';
    
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) return 'move';

    return '';
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const handle = getHandle(x, y);
    if (handle === 'move') {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    } else if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x, y });
    }
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isResizing) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, canvasRef.current!.width - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, canvasRef.current!.height - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      let newCropArea = { ...cropArea };
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;

      // Maintain aspect ratio
      const aspect = PASSPORT_DIMENSIONS.width / PASSPORT_DIMENSIONS.height;

      switch (resizeHandle) {
        case 'nw': {
          // Calculate new width and height maintaining aspect ratio
          let newWidth = cropArea.width - dx;
          let newHeight = newWidth * (PASSPORT_DIMENSIONS.height / PASSPORT_DIMENSIONS.width);
          if (newWidth > 50 && newHeight > 50 && cropArea.x + cropArea.width - newWidth >= 0 && cropArea.y + cropArea.height - newHeight >= 0) {
            newCropArea.x = cropArea.x + cropArea.width - newWidth;
            newCropArea.y = cropArea.y + cropArea.height - newHeight;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
            setCropArea(newCropArea);
            setDragStart({ x, y });
          }
          break;
        }
        case 'ne': {
          let newWidth = cropArea.width + dx;
          let newHeight = newWidth * (PASSPORT_DIMENSIONS.height / PASSPORT_DIMENSIONS.width);
          if (newWidth > 50 && newHeight > 50 && cropArea.x >= 0 && cropArea.y + cropArea.height - newHeight >= 0 && cropArea.x + newWidth <= canvasRef.current!.width) {
            newCropArea.y = cropArea.y + cropArea.height - newHeight;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
            setCropArea(newCropArea);
            setDragStart({ x, y });
          }
          break;
        }
        case 'sw': {
          let newWidth = cropArea.width - dx;
          let newHeight = newWidth * (PASSPORT_DIMENSIONS.height / PASSPORT_DIMENSIONS.width);
          if (newWidth > 50 && newHeight > 50 && cropArea.x + cropArea.width - newWidth >= 0 && cropArea.y >= 0 && cropArea.y + newHeight <= canvasRef.current!.height) {
            newCropArea.x = cropArea.x + cropArea.width - newWidth;
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
            setCropArea(newCropArea);
            setDragStart({ x, y });
          }
          break;
        }
        case 'se': {
          let newWidth = cropArea.width + dx;
          let newHeight = newWidth * (PASSPORT_DIMENSIONS.height / PASSPORT_DIMENSIONS.width);
          if (newWidth > 50 && newHeight > 50 && cropArea.x >= 0 && cropArea.y >= 0 && cropArea.x + newWidth <= canvasRef.current!.width && cropArea.y + newHeight <= canvasRef.current!.height) {
            newCropArea.width = newWidth;
            newCropArea.height = newHeight;
            setCropArea(newCropArea);
            setDragStart({ x, y });
          }
          break;
        }
      }
    }
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  const applyCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = PASSPORT_DIMENSIONS.width;
    canvas.height = PASSPORT_DIMENSIONS.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate the actual crop area on the original image
    const scaleX = image.width / canvasRef.current.width;
    const scaleY = image.height / canvasRef.current.height;
    
    const actualCropX = cropArea.x * scaleX;
    const actualCropY = cropArea.y * scaleY;
    const actualCropWidth = cropArea.width * scaleX;
    const actualCropHeight = cropArea.height * scaleY;

    // Draw the cropped image to passport dimensions
    ctx.drawImage(
      image,
      actualCropX, actualCropY, actualCropWidth, actualCropHeight,
      0, 0, PASSPORT_DIMENSIONS.width, PASSPORT_DIMENSIONS.height
    );

    onCropComplete(canvas);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Manual Crop - Adjust the crop area</h3>
        
        <div className="mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded cursor-crosshair max-w-full"
            onMouseDown={handleInteractionStart}
            onMouseMove={handleInteractionMove}
            onMouseUp={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchMove={handleInteractionMove}
            onTouchEnd={handleInteractionEnd}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={applyCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PassportPhotoMaker() {
  const [step, setStep] = useState(1);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  const [croppedImage, setCroppedImage] = useState<HTMLCanvasElement | null>(null);
  const [finalImage, setFinalImage] = useState<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>('white');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [customGradientStart, setCustomGradientStart] = useState('#ffffff');
  const [customGradientEnd, setCustomGradientEnd] = useState('#f0f0f0');
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [showCustomGradientPicker, setShowCustomGradientPicker] = useState(false);
  const [nameText, setNameText] = useState('');
  const [dateText, setDateText] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [nameSize, setNameSize] = useState(35);
  const [dateSize, setDateSize] = useState(20);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gradient templates
  const gradientTemplates = [
    { id: 'blue-light', name: 'Blue Light', start: '#e0f2fe', end: '#0ea5e9' },
    { id: 'blue-dark', name: 'Blue Dark', start: '#1e40af', end: '#0f172a' },
    { id: 'green-light', name: 'Blue Green', start: '#1493fcff', end: '#16a34a' },
    { id: 'green-dark', name: 'Gray Dark', start: '#2d2323ff', end: '#F4F0F0' },
    { id: 'purple-light', name: 'Purple Light', start: '#f3e8ff', end: '#9333ea' },
    { id: 'purple-dark', name: 'Purple Dark', start: '#7c3aed', end: '#1e1b4b' },
    { id: 'red-light', name: 'Red Light', start: '#fef2f2', end: '#dc2626' },
    { id: 'red-dark', name: 'Red Dark', start: '#991b1b', end: '#0f172a' },
    { id: 'orange-light', name: 'Pink Light', start: '#fff7ed', end: '#f223a9fd' },
    { id: 'orange-dark', name: 'Orange Dark', start: '#b54417ff', end: '#0f172a' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      setStep(2);
      processBackgroundRemoval(file);
    };
    img.src = URL.createObjectURL(file);
  };
//progress bar 
  const processBackgroundRemoval = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    let progressValue = 0;
    const increment = 3; // percent per tick
    const intervalMs = 500; // ms per tick
    let progressInterval: NodeJS.Timeout | null = null;
    let finished = false;
    progressInterval = setInterval(() => {
      if (progressValue < 100 && !finished) {
        progressValue += increment;
        if (progressValue > 100) progressValue = 100;
        setProgress(progressValue);
      } else {
        clearInterval(progressInterval!);
      }
    }, intervalMs);//ends

    try {
      const imageBlob = await removeBackground(file);
      finished = true;
      setProgress(100);
      clearInterval(progressInterval!);
      const img = new Image();
      img.onload = () => {
        setProcessedImage(img);
        setIsProcessing(false);
        // Automatically open manual cropper after background removal
        setShowCropper(true);
      };
      img.src = URL.createObjectURL(imageBlob);
    } catch (error) {
      finished = true;
      clearInterval(progressInterval!);
      console.error('Background removal failed:', error);
      setIsProcessing(false);
    }
  };

  const handleCropComplete = (croppedCanvas: HTMLCanvasElement) => {
    setCroppedImage(croppedCanvas);
    setShowCropper(false);
    setStep(3);
    generateFinalImage(croppedCanvas);
  };

  const generateFinalImage = (croppedCanvas: HTMLCanvasElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = PASSPORT_DIMENSIONS.width;
    canvas.height = PASSPORT_DIMENSIONS.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate background
    let backgroundCanvas;
    if (selectedBackground === 'custom') {
      backgroundCanvas = generateSolidBackground(PASSPORT_DIMENSIONS.width, PASSPORT_DIMENSIONS.height, customColor);
    } else if (selectedBackground === 'custom-gradient') {
      backgroundCanvas = generateGradientBackground(PASSPORT_DIMENSIONS.width, PASSPORT_DIMENSIONS.height, customGradientStart, customGradientEnd);
    } else if (selectedBackground.startsWith('gradient-')) {
      const template = gradientTemplates.find(t => t.id === selectedBackground.replace('gradient-', ''));
      if (template) {
        backgroundCanvas = generateGradientBackground(PASSPORT_DIMENSIONS.width, PASSPORT_DIMENSIONS.height, template.start, template.end);
      }
    } else {
      backgroundCanvas = generateSolidBackground(PASSPORT_DIMENSIONS.width, PASSPORT_DIMENSIONS.height, selectedBackground);
    }

    if (backgroundCanvas) {
      ctx.drawImage(backgroundCanvas, 0, 0);
    }

    // Apply image filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`;
    
    // Draw cropped image
    ctx.drawImage(croppedCanvas, 0, 0);
    
    // Reset filter
    ctx.filter = 'none';

    // Add text overlay with white background
    if (nameText || dateText) {
      const gap = 1; // 1 pixel between name and date
      // Add a small vertical padding to ensure text is within the background
      const verticalPadding = 4;
      let totalTextHeight = 0;
      if (nameText && dateText) {
        totalTextHeight = verticalPadding + nameSize + gap + dateSize + verticalPadding;
      } else if (nameText) {
        totalTextHeight = verticalPadding + nameSize + verticalPadding;
      } else if (dateText) {
        totalTextHeight = verticalPadding + dateSize + verticalPadding;
      } else {
        totalTextHeight = 60; // fallback
      }

      // White background for text, attached to the bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, PASSPORT_DIMENSIONS.height - totalTextHeight, PASSPORT_DIMENSIONS.width, totalTextHeight);

      // Text styling
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      let currentY = PASSPORT_DIMENSIONS.height - totalTextHeight + verticalPadding;
      if (nameText) {
        ctx.font = `bold ${nameSize}px Arial`;
        ctx.textBaseline = 'top';
        ctx.fillText(nameText, PASSPORT_DIMENSIONS.width / 2, currentY);
        currentY += nameSize;
        if (dateText) currentY += gap;
      }
      if (dateText) {
        ctx.font = `bold ${dateSize}px Arial`;
        ctx.textBaseline = 'top';
        ctx.fillText(dateText, PASSPORT_DIMENSIONS.width / 2, currentY);
      }
    }

    setFinalImage(canvas);
  };

  // Set current date as default when checkbox is checked
  useEffect(() => {
    if (showDate) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setDateText(`${day}/${month}/${year}`);
    } else {
      setDateText('');
    }
    // eslint-disable-next-line
  }, [showDate]);

  useEffect(() => {
    if (croppedImage) {
      generateFinalImage(croppedImage);
    }
  }, [selectedBackground, customColor, customGradientStart, customGradientEnd, nameText, dateText, nameSize, dateSize, brightness, contrast, saturation, hue]);

  const downloadImage = () => {
    if (finalImage) {
      downloadCanvasAsImage(finalImage, 'passport-photo.png');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold text-gray-900">Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-600">Manual Cropping</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Passport Photo Maker
          </h1>
          <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto">
            Create professional passport photos with manual cropping
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Upload Photo', icon: Upload },
              { num: 2, label: 'Remove Background', icon: Crop },
              { num: 3, label: 'Manual Crop', icon: Move },
              { num: 4, label: 'Customize Background', icon: Palette },
              { num: 5, label: 'Add Text & Download', icon: Download }
            ].map(({ num, label, icon: Icon }, index) => (
              <div key={num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= num ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'
                }`}>
                  {step > num ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm font-bold ${step >= num ? 'text-blue-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {index < 4 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Photo</h2>
                <p className="text-gray-600 font-bold mb-6">
                  Select a clear photo with good lighting for best results
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg"
                >
                  Select Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Background Removal */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Background Removal</h2>
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {isProcessing ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center animate-fade-in">
                      <svg className="w-32 h-32 mb-6 drop-shadow-xl" viewBox="0 0 120 120">
                        <defs>
                          <linearGradient id="loader-gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="50%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
                          </radialGradient>
                        </defs>
                        <circle
                          cx="60" cy="60" r="52"
                          fill="url(#glow)"
                        />
                        <circle
                          cx="60" cy="60" r="48"
                          fill="none"
                          stroke="#ede9fe"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60" cy="60" r="48"
                          fill="none"
                          stroke="url(#loader-gradient2)"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.3s cubic-bezier(.4,2,.6,1)' }}
                        />
                        <circle
                          cx="60" cy="60" r="38"
                          fill="none"
                          stroke="#f472b6"
                          strokeWidth="2"
                          strokeDasharray="6 8"
                          className="animate-spin-slow"
                        />
                        <g>
                          <text
                            x="60" y="68"
                            textAnchor="middle"
                            fontSize="2.2rem"
                            fontWeight="bold"
                            fill="#a21caf"
                            style={{ fontFamily: 'monospace', filter: 'drop-shadow(0 2px 8px #f472b6cc)' }}
                          >
                            {progress}%
                          </text>
                        </g>
                      </svg>
                      <div className="flex items-center gap-3 mb-3 animate-bounce">
                        <Zap className="w-7 h-7 text-pink-500 animate-spin-slow" />
                        <span className="text-xl font-extrabold text-purple-700 tracking-wide drop-shadow">AI Magic in Progress</span>
                        <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
                      </div>
                      <p className="text-base text-gray-700 font-semibold animate-pulse">Removing background... <span className="text-purple-500 font-bold">Please wait</span></p>
                      <div className="mt-4 flex gap-2">
                        <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-blink"></span>
                        <span className="inline-block w-2 h-2 bg-pink-400 rounded-full animate-blink [animation-delay:0.2s]"></span>
                        <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-blink [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                ) : processedImage ? (
                  <img 
                    src={processedImage.src} 
                    alt="Processed" 
                    className="w-full h-64 object-contain rounded-lg"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                  />
                ) : null}
                {/* Manual cropper will open automatically after background removal, no button needed */}
                {/* Hide suggestion message while processing */}
                {!isProcessing && (
                  <p className="text-gray-600 font-bold mb-6">Select a clear photo with good lighting for best results</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3+: Background and Text Customization */}
        {step >= 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
                <div className="flex justify-center">
                  {finalImage && (
                    <canvas
                      ref={(canvas) => {
                        if (canvas && finalImage) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            canvas.width = finalImage.width;
                            canvas.height = finalImage.height;
                            ctx.drawImage(finalImage, 0, 0);
                          }
                        }
                      }}
                      className="border border-gray-300 rounded-lg max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                  )}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={downloadImage}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold text-lg mr-4"
                  >
                    <Download className="w-5 h-5 inline mr-2" />
                    Download Photo
                  </button>
                  
                  <button
                    onClick={() => setShowCropper(true)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                  >
                    <Crop className="w-5 h-5 inline mr-2" />
                    Re-crop
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Background Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Background</h3>
                
                {/* Gradient Templates */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {gradientTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedBackground(`gradient-${template.id}`)}
                      className={`w-12 h-12 rounded-lg border-2 ${
                        selectedBackground === `gradient-${template.id}` ? 'border-blue-500' : 'border-gray-200'
                      }`}
                      style={{
                        background: `linear-gradient(to bottom, ${template.start}, ${template.end})`
                      }}
                      title={template.name}
                    >
                      {selectedBackground === `gradient-${template.id}` && (
                        <CheckCircle className="w-4 h-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color */}
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setShowCustomColorPicker(!showCustomColorPicker)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                      selectedBackground === 'custom' ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: customColor }}
                  >
                    <Pipette className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-gray-700">Custom Color</span>
                </div>

                {showCustomColorPicker && (
                  <div className="mb-4">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedBackground('custom');
                      }}
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                )}

                {/* Custom Gradient */}
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setShowCustomGradientPicker(!showCustomGradientPicker)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                      selectedBackground === 'custom-gradient' ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    style={{
                      background: `linear-gradient(to bottom, ${customGradientStart}, ${customGradientEnd})`
                    }}
                  >
                    <Droplet className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-sm font-bold text-gray-700">Custom Gradient</span>
                </div>

                {showCustomGradientPicker && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <input
                        type="color"
                        value={customGradientStart}
                        onChange={(e) => {
                          setCustomGradientStart(e.target.value);
                          setSelectedBackground('custom-gradient');
                        }}
                        className="flex-1 h-8 rounded border border-gray-300"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Moon className="w-4 h-4 text-blue-500" />
                      <input
                        type="color"
                        value={customGradientEnd}
                        onChange={(e) => {
                          setCustomGradientEnd(e.target.value);
                          setSelectedBackground('custom-gradient');
                        }}
                        className="flex-1 h-8 rounded border border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Text Overlay */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Text Overlay</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-400"
                      placeholder="Enter name"
                    />
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Size: {nameSize}px</label>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={nameSize}
                        onChange={(e) => setNameSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <input
                      id="show-date-checkbox"
                      type="checkbox"
                      checked={showDate}
                      onChange={e => setShowDate(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <label htmlFor="show-date-checkbox" className="text-sm font-bold text-gray-700 select-none cursor-pointer">Add current date</label>
                  </div>
                  {showDate && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Date: {dateText}</label>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Size: {dateSize}px</label>
                      <input
                        type="range"
                        min="8"
                        max="30"
                        value={dateSize}
                        onChange={(e) => setDateSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Adjustments */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Image Adjustments</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Brightness: {brightness}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contrast: {contrast}%</label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Saturation: {saturation}%</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hue: {hue}°</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={hue}
                      onChange={(e) => setHue(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Cropper Modal */}
        {showCropper && processedImage && (
          <ManualCropper
            image={processedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setShowCropper(false)}
          />
        )}
      </div>
    </div>
  );
}
