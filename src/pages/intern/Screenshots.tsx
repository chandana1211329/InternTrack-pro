import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import ScreenshotCapture from '../../components/ScreenshotCapture';
import { screenshotService, Screenshot } from '../../services/screenshotService';

const Screenshots: React.FC = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCapture, setShowCapture] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScreenshots();
  }, [selectedDate]);

  const loadScreenshots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await screenshotService.getMyScreenshots(selectedDate);
      setScreenshots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load screenshots');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (imageData: string, description?: string) => {
    try {
      await screenshotService.uploadScreenshot(imageData, description);
      setShowCapture(false);
      loadScreenshots();
    } catch (err: any) {
      setError(err.message || 'Failed to upload screenshot');
    }
  };

  const handleDelete = async (screenshotId: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      try {
        await screenshotService.deleteScreenshot(screenshotId);
        loadScreenshots();
      } catch (err: any) {
        setError(err.message || 'Failed to delete screenshot');
      }
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = screenshotService.getFullImageUrl(imageUrl);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showCapture) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => setShowCapture(false)}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to Screenshots
          </button>
          <ScreenshotCapture onCapture={handleCapture} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Screenshots</h1>
          <button
            onClick={() => setShowCapture(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Camera size={20} />
            <span>Capture Screenshot</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar size={20} className="text-gray-600" />
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Filter by date:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : screenshots.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No screenshots found</h3>
            <p className="text-gray-600 mb-6">
              {selectedDate === new Date().toISOString().split('T')[0]
                ? 'Capture your first screenshot to get started'
                : 'No screenshots available for this date'}
            </p>
            <button
              onClick={() => setShowCapture(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Capture Screenshot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={screenshotService.getFullImageUrl(screenshot.imageUrl)}
                    alt="Screenshot"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => downloadImage(screenshot.imageUrl, screenshot.filename)}
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                      title="Download"
                    >
                      <Download size={16} className="text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(screenshot.id)}
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(screenshot.timestamp).toLocaleString()}
                  </p>
                  {screenshot.description && (
                    <p className="text-gray-800 text-sm mb-2">{screenshot.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {Math.round(screenshot.fileSize / 1024)} KB • {screenshot.mimeType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Screenshots;
