'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// SVG Icons for a cleaner UI without external dependencies
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto text-gray-400">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-500">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const Spinner = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin h-5 w-5 mr-3">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState(null);
  const [error, setError] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [total, setTotal] = useState('0.00');

  // Calculate the total amount whenever items change
  useEffect(() => {
    const newTotal = editableItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price;
    }, 0).toFixed(2);
    setTotal(newTotal);
  }, [editableItems]);


  // Function to handle file selection from input or drag-and-drop
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Handler for the file input change event
  const onFileChange = (event) => {
    handleFileSelect(event.target.files[0]);
  };
  
  // Handlers for drag-and-drop functionality
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);


  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setBillData(null); // Clear previous results

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/parse-bill', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
      
      setBillData(result);
      setEditableItems(result.items || []);

    } catch (err) {
      setError(err.message || 'Failed to upload and process the image');
    } finally {
      setLoading(false);
    }
  };

  // Functions to manage the editable items list
  const updateItem = (index, field, value) => {
    const updatedItems = [...editableItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditableItems(updatedItems);
  };

  const addItem = () => {
    setEditableItems([...editableItems, { name: '', price: '0.00' }]);
  };

  const removeItem = (index) => {
    const updatedItems = editableItems.filter((_, i) => i !== index);
    setEditableItems(updatedItems);
  };

  const handleSplitBill = () => {
    // Store the bill data in localStorage to pass to the split page
    const billDataToPass = {
      items: editableItems,
      total: total
    };
    localStorage.setItem('billData', JSON.stringify(billDataToPass));
    router.push('/split');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
       <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-animation 2s ease infinite;
        }
      `}</style>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Smart Bill Parser
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Upload an image of your bill to automatically extract the details.
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Upload Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                <h2 className="text-2xl font-semibold mb-5 text-slate-800 border-b border-slate-200 pb-3">Upload Your Bill</h2>
                
                <div 
                  className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300'}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  {!previewUrl ? (
                    <label htmlFor="file-upload" className="text-center cursor-pointer">
                      <UploadIcon />
                      <p className="mt-2 text-sm font-semibold text-orange-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                    </label>
                  ) : (
                    <div className="text-center">
                        <img src={previewUrl} alt="Bill preview" className="max-h-40 rounded-lg mx-auto mb-4 shadow-md"/>
                        <p className="text-sm text-slate-700 font-medium truncate max-w-xs">{selectedFile?.name}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className={`mt-6 w-full flex items-center justify-center text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-75 animate-gradient ${
                    loading
                      ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500'
                  }`}
                >
                  {loading && <Spinner />}
                  {loading ? 'Processing...' : 'Parse Bill'}
                </button>
                
                {selectedFile && !loading && (
                    <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-sm text-red-500 hover:underline mt-4">
                        Remove Bill
                    </button>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
                    <p><span className="font-bold">Error:</span> {error}</p>
                  </div>
                )}
              </div>

              {/* Right Column: Results Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                <h2 className="text-2xl font-semibold mb-5 text-slate-800 border-b border-slate-200 pb-3">Extracted Items</h2>
                
                {loading && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-10 bg-slate-200 rounded-md"></div>
                    <div className="h-10 bg-slate-200 rounded-md"></div>
                    <div className="h-10 bg-slate-200 rounded-md"></div>
                  </div>
                )}

                {!loading && billData && (
                  <>
                    <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                      {editableItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            placeholder="Item name"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-28 pl-7 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-slate-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                            aria-label="Remove item"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={addItem}
                        className="w-full flex items-center justify-center bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 font-semibold transition-colors"
                      >
                        <PlusIcon />
                        Add Item
                      </button>
                    </div>
                  </>
                )}
                
                {!loading && !billData && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                        <FileIcon />
                        <p className="mt-2 font-medium">Your parsed bill will appear here.</p>
                        <p className="text-sm">Upload an image to get started.</p>
                    </div>
                )}
              </div>
            </div>

            {/* Total Section - Placed outside and below the grid */}
            {billData && !loading && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                     <div className="flex justify-between items-center text-2xl font-bold text-slate-900 mb-4">
                        <span>Total:</span>
                        <span className="text-orange-600">${total}</span>
                    </div>
                    <button
                      onClick={handleSplitBill}
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md animate-gradient"
                    >
                      Split Bill
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
