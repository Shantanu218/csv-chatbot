import Papa from 'papaparse';
import { CSVData } from '../types';

/**
 * Parse a CSV file and return the data
 * @param file The CSV file to parse
 * @returns A promise that resolves to the parsed CSV data
 */
export const parseCSVFile = (file: File): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          // Filter out empty row errors which are common at the end of files
          const significantErrors = results.errors.filter(
            error => error.code !== 'TooFewFields' && error.code !== 'UndetectableDelimiter'
          );
          
          if (significantErrors.length > 0) {
            reject(new Error(`Error parsing CSV: ${significantErrors[0].message}`));
            return;
          }
        }
        
        // Remove empty rows (often at the end of the file)
        const cleanData = results.data.filter(row => {
          // Check if all fields in this row are empty or undefined
          return Object.values(row).some(value => 
            value !== null && value !== undefined && String(value).trim() !== ''
          );
        });
        
        const csvData: CSVData = {
          data: cleanData,
          meta: results.meta
        };
        
        resolve(csvData);
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    });
  });
};

/**
 * Validate a CSV file before parsing
 * @param file The file to validate
 * @returns An object with isValid and message properties
 */
export const validateCSVFile = (file: File): { isValid: boolean; message?: string } => {
  // Check file type
  if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
    return { 
      isValid: false, 
      message: 'Invalid file type. Please upload a CSV file.' 
    };
  }
  
  // Check file size (limit to 5MB for web browser performance)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `File size exceeds the limit of 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` 
    };
  }
  
  return { isValid: true };
};

/**
 * Generate a summary of the CSV data
 * @param data The CSV data to summarize
 * @returns A summary object with information about the data
 */
export const generateDataSummary = (data: CSVData) => {
  const rowCount = data.data.length;
  const columnCount = data.meta.fields.length;
  
  // Get column types
  const columnTypes: Record<string, string> = {};
  data.meta.fields.forEach(field => {
    // Check the first few non-null values to determine type
    for (let i = 0; i < Math.min(10, rowCount); i++) {
      const value = data.data[i][field];
      if (value !== null && value !== undefined) {
        if (typeof value === 'number') {
          columnTypes[field] = 'number';
        } else if (typeof value === 'boolean') {
          columnTypes[field] = 'boolean';
        } else if (typeof value === 'string') {
          // Try to detect dates
          if (!isNaN(Date.parse(value as string))) {
            columnTypes[field] = 'date';
          } else {
            columnTypes[field] = 'string';
          }
        }
        break;
      }
    }
    
    // If no type detected, default to string
    if (!columnTypes[field]) {
      columnTypes[field] = 'string';
    }
  });
  
  return {
    rowCount,
    columnCount,
    columnTypes,
    sampleData: data.data.slice(0, 3)
  };
};