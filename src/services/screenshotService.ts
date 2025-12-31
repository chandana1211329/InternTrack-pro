const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Screenshot {
  id: string;
  imageUrl: string;
  timestamp: string;
  description?: string;
  filename: string;
  fileSize: number;
  mimeType: string;
}

export interface ScreenshotUploadResponse {
  message: string;
  screenshot: {
    id: string;
    imageUrl: string;
    timestamp: string;
    description?: string;
  };
}

class ScreenshotService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async uploadScreenshot(imageData: string, description?: string): Promise<ScreenshotUploadResponse> {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('screenshot', blob, `screenshot-${Date.now()}.jpg`);
      if (description) {
        formData.append('description', description);
      }

      const uploadResponse = await fetch(`${API_BASE_URL}/api/screenshots/upload`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Failed to upload screenshot');
      }

      return await uploadResponse.json();
    } catch (error) {
      console.error('Screenshot upload error:', error);
      throw error;
    }
  }

  async getMyScreenshots(date?: string, limit: number = 20): Promise<Screenshot[]> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/screenshots/my-screenshots?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch screenshots');
      }

      const data = await response.json();
      return data.screenshots;
    } catch (error) {
      console.error('Get screenshots error:', error);
      throw error;
    }
  }

  async getUserScreenshots(userId: string, date?: string, limit: number = 20, page: number = 1): Promise<{
    screenshots: Screenshot[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      params.append('limit', limit.toString());
      params.append('page', page.toString());

      const response = await fetch(`${API_BASE_URL}/api/screenshots/user/${userId}?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user screenshots');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user screenshots error:', error);
      throw error;
    }
  }

  async deleteScreenshot(screenshotId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/screenshots/${screenshotId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete screenshot');
      }
    } catch (error) {
      console.error('Delete screenshot error:', error);
      throw error;
    }
  }

  async getScreenshotStats(period: 'day' | 'week' | 'month' = 'week'): Promise<Array<{
    _id: string;
    count: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/screenshots/stats?period=${period}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch screenshot statistics');
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  getFullImageUrl(imageUrl: string): string {
    return `${API_BASE_URL}${imageUrl}`;
  }
}

export const screenshotService = new ScreenshotService();
