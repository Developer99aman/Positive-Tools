'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Zap, Shield, Sparkles, FileImage, Sliders } from 'lucide-react';

export default function ImageCompressor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const compressImage = useCallback((file: File, quality: number, format: string) => {
    return new Promise<{ blob: Blob; dataUrl: string }>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          const mimeType = format === 'png' ? 'image/png' : 
                          format === 'webp' ? 'image/webp' : 'image/jpeg';
          
          canvas.toBlob((blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL(mimeType, quality / 100);
              resolve({ blob, dataUrl });
            }
          }, mimeType, quality / 100);
        }
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setSelectedFiles([file]);
    setOriginalSize(file.size);
    
    // Create preview of original
    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);
    
    // Compress with current settings
    const { blob, dataUrl } = await compressImage(file, quality, format);
    setCompressedImage(dataUrl);
    setCompressedSize(blob.size);
  }, [compressImage, quality, format]);

  // Real-time compression when quality or format changes
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      compressImage(file, quality, format).then(({ blob, dataUrl }) => {
        setCompressedImage(dataUrl);
        setCompressedSize(blob.size);
      });
    }
  }, [quality, format, selectedFiles, compressImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const downloadCompressed = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[0];
    const { blob } = await compressImage(file, quality, format);
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `compressed-${file.name.split('.')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedFiles, quality, format, compressImage]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : '0';

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  // Touch event version of updateSliderPosition
  const updateSliderPositionTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleSliderMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold text-gray-900">Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-600">Real-time Compression</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Image Compressor
          </h1>
          <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto">
            Reduce image file sizes while maintaining quality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload & Compress</h2>
              
              {!originalImage ? (
                <div
                  className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-700 mb-2">
                    Upload images to compress
                  </p>
                  <p className="text-gray-500 font-bold mb-4">
                    Supports JPG, PNG, WebP up to 10MB each
                  </p>
                  <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold">
                    Select Images
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Before/After Comparison */}
                  <div className="relative">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Before / After Comparison</h3>
                    <div 
                      ref={containerRef}
                      className={`relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-col-resize${isDragging ? ' select-none' : ''}`}
                      onMouseDown={handleSliderMouseDown}
                      onMouseMove={handleSliderMouseMove}
                      onMouseUp={handleSliderMouseUp}
                      onMouseLeave={handleSliderMouseUp}
                      onTouchStart={(e) => {
                        setIsDragging(true);
                        updateSliderPositionTouch(e);
                      }}
                      onTouchMove={(e) => {
                        if (isDragging) updateSliderPositionTouch(e);
                      }}
                      onTouchEnd={() => setIsDragging(false)}
                      style={{ userSelect: isDragging ? 'none' : undefined }}
                    >
                      {/* Original Image (full, background) */}
                      <div className="absolute inset-0">
                        <img
                          src={originalImage}
                          alt="Original"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                          Original: {formatFileSize(originalSize)}
                        </div>
                      </div>

                      {/* Compressed Image (clipped to right of slider) */}
                      {compressedImage && (
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                        >
                          <img
                            src={compressedImage}
                            alt="Compressed"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">
                            Compressed: {formatFileSize(compressedSize)}
                          </div>
                        </div>
                      )}

                      {/* Slider */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <Sliders className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                        BEFORE
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                        AFTER
                      </div>
                    </div>
                  </div>

                  {/* Compression Stats */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-bold text-gray-600">Original Size</p>
                        <p className="text-lg font-bold text-gray-900">{formatFileSize(originalSize)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Compressed Size</p>
                        <p className="text-lg font-bold text-green-600">{formatFileSize(compressedSize)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-600">Reduction</p>
                        <p className="text-lg font-bold text-blue-600">{compressionRatio}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={downloadCompressed}
                      className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Compressed</span>
                    </button>

                    <button
                      onClick={() => {
                        setOriginalImage(null);
                        setCompressedImage(null);
                        setSelectedFiles([]);
                        setOriginalSize(0);
                        setCompressedSize(0);
                      }}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload New</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handleFileSelect(files);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compression Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Compression Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className="font-bold">Smaller</span>
                    <span className="font-bold">Larger</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Output Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-bold text-gray-700 mb-2"
                  >
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                   
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                {[
                  'Real-time compression preview',
                  'Before/after comparison slider',
                  'Multiple format support',
                  'Batch processing ready',
                  'Client-side processing (privacy)'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-bold">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quality Guide */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-900 mb-4">Quality Guide</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">90-100%:</span>
                  <span className="font-bold text-green-600">Highest quality</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">70-90%:</span>
                  <span className="font-bold text-green-600">Good quality</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">50-70%:</span>
                  <span className="font-bold text-green-600">Medium quality</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">10-50%:</span>
                  <span className="font-bold text-green-600">Low quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

