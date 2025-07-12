'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, Image as ImageIcon, Zap, Shield, Sparkles, Sliders } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export default function HdBackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: string;
    format: string;
  } | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Slider logic for preview (desktop)
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e);
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

  // Touch event version for mobile
  const updateSliderPositionTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
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

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setProcessedImage(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      
      // Get image info
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          format: file.type.split('/')[1].toUpperCase()
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    
    // Automatically start processing
    processBackgroundRemoval(file);
  }, []);

  const processBackgroundRemoval = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Use the @imgly/background-removal library
      const imageBlob = await removeBackground(file);
      
      // Create URL for the processed image
      const url = URL.createObjectURL(imageBlob);
      setProcessedImage(url);
      setProgress(100);
      
    } catch (err) {
      console.error('Background removal failed:', err);
      setError('Failed to remove background. Please try again with a different image.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  const downloadImage = useCallback(() => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold text-gray-900">Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">AI-Powered</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            HD Background Remover
          </h1>
          <p className="text-xl font-semibold text-gray-600 max-w-2xl mx-auto">
            Remove backgrounds from high-resolution images with AI precision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Image</h2>
              
              {!originalImage ? (
                <div
                  className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-700 mb-2">
                    Upload a high-resolution image
                  </p>
                  <p className="text-gray-500 font-semibold mb-4">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold">
                    Select Image
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Slider Preview */}
                  <div className="relative">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Before / After Comparison</h3>
                    <div
                      ref={containerRef}
                      className={`relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-col-resize${isDragging ? ' select-none' : ''}`}
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
                      {/* Original Image (background) */}
                      {originalImage && (
                        <div className="absolute inset-0">
                          <img
                            src={originalImage}
                            alt="Original"
                            className="w-full h-full object-contain"
                          />
                          {imageInfo && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                              {imageInfo.width} × {imageInfo.height} • {imageInfo.size}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Processed Image (clipped to right of slider) */}
                      {processedImage && (
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                        >
                          <img
                            src={processedImage}
                            alt="Background Removed"
                            className="w-full h-full object-contain"
                            style={{
                              backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                              backgroundSize: '20px 20px',
                              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                            }}
                          />
                        </div>
                      )}

                      {/* Slider */}
                      {originalImage && processedImage && (
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
                          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                        >
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <Sliders className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                      )}

                      {/* Labels */}
                      {originalImage && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                          BEFORE
                        </div>
                      )}
                      {processedImage && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                          AFTER
                        </div>
                      )}

                      {/* Processing overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-purple-600 font-bold">Processing... {progress}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {processedImage && (
                      <button
                        onClick={downloadImage}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setOriginalImage(null);
                        setProcessedImage(null);
                        setSelectedFile(null);
                        setImageInfo(null);
                        setError(null);
                      }}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload New</span>
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 font-bold">{error}</p>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                {[
                  'AI-powered background removal',
                  'Preserves original image quality',
                  'Supports high-resolution images',
                  'Transparent PNG output',
                  'Client-side processing (privacy)'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-semibold">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-4">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="font-semibold">• Use images with clear subject-background contrast</li>
                <li className="font-semibold">• Avoid complex backgrounds for better accuracy</li>
                <li className="font-semibold">• Higher resolution images yield better results</li>
                <li className="font-semibold">• Good lighting improves edge detection</li>
                <li className="font-semibold">• Works best with people, objects, and animals</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

