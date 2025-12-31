import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ScreenshotCaptureProps {
  onCapture: (imageData: string, description?: string) => void;
}

const ScreenshotCapture: React.FC<ScreenshotCaptureProps> = ({ onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access denied. Please allow camera permissions or use file upload.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (preview) {
      onCapture(preview, description);
      resetForm();
    }
  };

  const resetForm = () => {
    setPreview(null);
    setDescription('');
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Capture Screenshot</h3>
      
      {!preview && (
        <div className="space-y-4">
          {isCapturing ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={capturePhoto}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Camera size={20} />
                  <span>Capture</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <Camera size={20} />
                <span>Open Camera</span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500">OR</span>
                </div>
                <hr className="border-gray-300" />
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <Upload size={20} />
                <span>Upload Image</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Screenshot preview"
              className="w-full rounded-lg"
            />
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={500}
          />
          
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Screenshot
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScreenshotCapture;
