import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(__dirname, 'mockData.json');

interface MockData {
  [key: string]: any;
}

let mockData: MockData = {};

// Load data from file on startup
function loadData(): void {
  try {
    if (existsSync(DATA_FILE)) {
      const data = readFileSync(DATA_FILE, 'utf8');
      mockData = JSON.parse(data);
      console.log('Loaded mock data from file');
    } else {
      console.log('No existing data file found, starting fresh');
    }
  } catch (error) {
    console.warn('Error loading data file:', error);
    mockData = {};
  }
}

// Save data to file
function saveData(): void {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(mockData, null, 2));
    console.log('Saved mock data to file');
  } catch (error) {
    console.warn('Error saving data file:', error);
  }
}

// Get data
function getData(key: string): any {
  return mockData[key];
}

// Set data
function setData(key: string, value: any): void {
  mockData[key] = value;
  saveData();
}

// Delete data
function deleteData(key: string): void {
  delete mockData[key];
  saveData();
}

// Get all data for a collection
function getCollectionData(collectionName: string): any[] {
  return Object.entries(mockData)
    .filter(([key]) => key.startsWith(`${collectionName}/`))
    .map(([key, data]) => data);
}

// Initialize by loading data
loadData();

export { getData, setData, deleteData, getCollectionData, saveData };
