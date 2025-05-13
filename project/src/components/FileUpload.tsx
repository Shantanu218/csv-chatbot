import React, { useCallback, useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FileUpload: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const { setCsvData, setFileName, isLoading, setIsLoading } = useData();

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleFile = useCallback((file: File) => {
        setUploadError(null);

        // Check file type
        if (!file.name.endsWith('.csv')) {
            setUploadError('Only CSV files are supported');
            toast.error('Only CSV files are supported');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File size exceeds the 5MB limit');
            toast.error('File size exceeds the 5MB limit');
            return;
        }

        setIsLoading(true);
        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error('Parse errors:', results.errors);
                    setUploadError('Error parsing CSV file. Please check the file format.');
                    toast.error('Error parsing CSV file. Please check the file format.');
                    setIsLoading(false);
                    return;
                }

                if (results.data.length === 0) {
                    setUploadError('The CSV file is empty');
                    toast.error('The CSV file is empty');
                    setIsLoading(false);
                    return;
                }

                setCsvData(results);
                setIsLoading(false);
                toast.success('Successfully loaded CSV file');
            },
            error: (error) => {
                console.error('Parse error:', error);
                setUploadError(`Error: ${error}`);
                toast.error(`Error: ${error}`);
                setIsLoading(false);
            }
        });
    }, [setCsvData, setFileName, setIsLoading]);

    return (
        <div className="p-[4rem] xl:p-[6rem]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Upload your CSV file
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file to start analyzing your data. You can then chat with an AI assistant to extract insights.
            </p>

            <div
                className={`upload-zone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Parsing your CSV file...</p>
                    </div>
                ) : (
                    <motion.div
                        className="flex flex-col items-center justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Upload className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                            Drag and drop your CSV file here
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 mb-4 text-sm">
                            or click to browse your files
                        </p>



                        <label className="btn btn-primary cursor-pointer">
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            Select CSV file
                        </label>

                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                            Maximum file size: 5MB

                            {uploadError && (
                                <div className="mt-2 text-error-500 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    <span>{uploadError}</span>
                                </div>
                            )}
                        </p>

                    </motion.div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                    Need a sample?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Download one of our sample CSV files to try out the app:
                </p>

                <div className="space-y-2">
                    <SampleFileButton
                        name="Sales Data"
                        description="10,000 rows of retail sales transactions"
                        onClick={() => {
                            // This would typically download a sample file
                            toast('Sample file functionality not implemented in this demo', {
                                icon: ''
                            });
                        }}
                    />

                    <SampleFileButton
                        name="Customer Survey"
                        description="500 rows of customer feedback responses"
                        onClick={() => {
                            toast('Sample file functionality not implemented in this demo', {
                                icon: ''
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const SampleFileButton: React.FC<{
    name: string;
    description: string;
    onClick: () => void;
}> = ({ name, description, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
        >
            <FileSpreadsheet className="h-5 w-5 text-primary-500 mr-3" />
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
            </div>
        </button>
    );
};

export default FileUpload;