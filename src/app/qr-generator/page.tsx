'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, QrCode, Wifi, Mail, Phone, MapPin, Calendar, User, Link as LinkIcon } from 'lucide-react';
import QRCode from 'qrcode';

type QRType = 'text' | 'url' | 'wifi' | 'email' | 'sms' | 'phone' | 'location' | 'contact' | 'event';

interface QRData {
  text: string;
  url: string;
  wifi: {
    ssid: string;
    password: string;
    security: 'WPA' | 'WEP' | 'nopass';
    hidden: boolean;
  };
  email: {
    email: string;
    subject: string;
    body: string;
  };
  sms: {
    phone: string;
    message: string;
  };
  phone: string;
  location: {
    latitude: string;
    longitude: string;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
    organization: string;
  };
  event: {
    title: string;
    start: string;
    end: string;
    location: string;
    description: string;
  };
}

export default function QRGenerator() {
  const [qrType, setQrType] = useState<QRType>('text');
  const [qrData, setQrData] = useState<QRData>({
    text: '',
    url: '',
    wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
    email: { email: '', subject: '', body: '' },
    sms: { phone: '', message: '' },
    phone: '',
    location: { latitude: '', longitude: '' },
    contact: { name: '', phone: '', email: '', organization: '' },
    event: { title: '', start: '', end: '', location: '', description: '' }
  });
  const [qrCode, setQrCode] = useState<string>('');
  const [qrSize, setQrSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrTypes = [
    { id: 'text', label: 'Text', icon: QrCode },
    { id: 'url', label: 'URL', icon: LinkIcon },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'sms', label: 'SMS', icon: Phone },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'event', label: 'Event', icon: Calendar }
  ];

  const generateQRString = () => {
    switch (qrType) {
      case 'text':
        return qrData.text;
      case 'url':
        return qrData.url;
      case 'wifi':
        return `WIFI:T:${qrData.wifi.security};S:${qrData.wifi.ssid};P:${qrData.wifi.password};H:${qrData.wifi.hidden ? 'true' : 'false'};;`;
      case 'email':
        return `mailto:${qrData.email.email}?subject=${encodeURIComponent(qrData.email.subject)}&body=${encodeURIComponent(qrData.email.body)}`;
      case 'sms':
        return `sms:${qrData.sms.phone}?body=${encodeURIComponent(qrData.sms.message)}`;
      case 'phone':
        return `tel:${qrData.phone}`;
      case 'location':
        return `geo:${qrData.location.latitude},${qrData.location.longitude}`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${qrData.contact.name}\nTEL:${qrData.contact.phone}\nEMAIL:${qrData.contact.email}\nORG:${qrData.contact.organization}\nEND:VCARD`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${qrData.event.title}\nDTSTART:${qrData.event.start.replace(/[-:]/g, '')}\nDTEND:${qrData.event.end.replace(/[-:]/g, '')}\nLOCATION:${qrData.event.location}\nDESCRIPTION:${qrData.event.description}\nEND:VEVENT`;
      default:
        return '';
    }
  };

  const generateQR = async () => {
    const qrString = generateQRString();
    if (!qrString) return;

    try {
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: qrSize,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: qrColor,
          light: bgColor
        }
      });
      setQrCode(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQR();
  }, [qrType, qrData, qrSize, errorCorrection, qrColor, bgColor]);

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${qrType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateQRData = (field: string, value: any) => {
    setQrData(prev => ({
      ...prev,
      [qrType]: {
        ...((prev[qrType as keyof QRData] as object) || {}),
        [field]: value
      }
    }));
  };

  const renderInputFields = () => {
    switch (qrType) {
      case 'text':
        return (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Text Content</label>
            <textarea
              value={qrData.text}
              onChange={(e) => setQrData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              rows={4}
              placeholder="Enter your text here..."
            />
          </div>
        );

      case 'url':
        return (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              value={qrData.url}
              onChange={(e) => setQrData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              placeholder="https://example.com"
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Network Name (SSID)</label>
              <input
                type="text"
                value={qrData.wifi.ssid}
                onChange={(e) => updateQRData('ssid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="WiFi Network Name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={qrData.wifi.password}
                onChange={(e) => updateQRData('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="WiFi Password"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Security Type</label>
              <select
                value={qrData.wifi.security}
                onChange={(e) => updateQRData('security', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hidden"
                checked={qrData.wifi.hidden}
                onChange={(e) => updateQRData('hidden', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hidden" className="text-sm font-bold text-gray-700">Hidden Network</label>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={qrData.email.email}
                onChange={(e) => updateQRData('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={qrData.email.subject}
                onChange={(e) => updateQRData('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea
                value={qrData.email.body}
                onChange={(e) => updateQRData('body', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                rows={3}
                placeholder="Email message"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={qrData.sms.phone}
                onChange={(e) => updateQRData('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
              <textarea
                value={qrData.sms.message}
                onChange={(e) => updateQRData('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                rows={3}
                placeholder="SMS message"
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={qrData.phone}
              onChange={(e) => setQrData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              placeholder="+1234567890"
            />
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={qrData.location.latitude}
                onChange={(e) => updateQRData('latitude', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="40.7128"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={qrData.location.longitude}
                onChange={(e) => updateQRData('longitude', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="-74.0060"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={qrData.contact.name}
                onChange={(e) => updateQRData('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={qrData.contact.phone}
                onChange={(e) => updateQRData('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={qrData.contact.email}
                onChange={(e) => updateQRData('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Organization</label>
              <input
                type="text"
                value={qrData.contact.organization}
                onChange={(e) => updateQRData('organization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="Company Name"
              />
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={qrData.event.title}
                onChange={(e) => updateQRData('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="Meeting Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={qrData.event.start}
                  onChange={(e) => updateQRData('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={qrData.event.end}
                  onChange={(e) => updateQRData('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={qrData.event.location}
                onChange={(e) => updateQRData('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                placeholder="Meeting Room A"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={qrData.event.description}
                onChange={(e) => updateQRData('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                rows={3}
                placeholder="Event description"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold text-gray-900">Back to Hub</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-600">8 QR Types</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            QR Code Generator
          </h1>
          <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto">
            Generate QR codes for text, URLs, WiFi, contacts, and more
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code Content</h2>
              
              {/* QR Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">QR Code Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {qrTypes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setQrType(id as QRType)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        qrType === id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className=" text-green-600 mb-6">
                {renderInputFields()}
              </div>

              {/* QR Code Preview */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">QR Code Preview</h3>
                {qrCode ? (
                  <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="mx-auto" />
                  </div>
                ) : (
                  <div className="inline-block p-8 bg-gray-100 border border-gray-200 rounded-lg">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-bold">Enter content to generate QR code</p>
                  </div>
                )}
                
                {qrCode && (
                  <div className="mt-4">
                    <button
                      onClick={downloadQR}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-bold"
                    >
                      <Download className="w-5 h-5 inline mr-2" />
                      Download QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Customization */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customization</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Size: {qrSize}px</label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Error Correction</label>
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-orange-500"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">QR Color</label>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">Tips</h3>
              <ul className="space-y-2 text-sm text-indigo-700">
                <li className="font-bold">• Test QR codes before printing</li>
                <li className="font-bold">• Use high error correction for damaged surfaces</li>
                <li className="font-bold">• Ensure good contrast between colors</li>
                <li className="font-bold">• Keep content concise for better scanning</li>
                <li className="font-bold">• Print at least 2cm × 2cm for mobile scanning</li>
              </ul>
            </div>

            {/* Information */}
            <div className="bg-gray-300 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Format:</span>
                  <span className="font-bold text-gray-900">PNG</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Size:</span>
                  <span className="font-bold text-gray-900">{qrSize} × {qrSize}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Error Correction:</span>
                  <span className="font-bold text-gray-900">{errorCorrection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">Type:</span>
                  <span className="font-bold text-gray-900 capitalize">{qrType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

