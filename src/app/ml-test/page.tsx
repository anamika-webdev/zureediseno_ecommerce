// ============================================
// FILE 3 (OPTIONAL): src/app/ml-test/page.tsx
// Test page to verify ML integration
// ============================================
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';

export default function MLTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending to ML API...');
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('ML Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to process image');
      }

      setResult(data.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>ML Model Test Page</CardTitle>
          <p className="text-sm text-gray-600">
            Test your ML model integration (http://164.52.214.147:7000/predict)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="test-file-upload"
              disabled={isLoading}
            />
            <label htmlFor="test-file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload a test image
              </p>
              <Button disabled={isLoading} asChild>
                <span>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Select Image'
                  )}
                </span>
              </Button>
            </label>
          </div>

          {/* Preview */}
          {selectedImage && (
            <div>
              <h3 className="font-semibold mb-2">Uploaded Image:</h3>
              <img
                src={selectedImage}
                alt="Test"
                className="max-w-md mx-auto border rounded-lg"
              />
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-gray-600 mt-2">
                Sending to ML model...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  ✅ Success! ML Model Response:
                </h3>
                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {/* Parsed Measurements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Parsed Measurements:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result).map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded border">
                      <span className="text-sm text-gray-600 capitalize">
                        {key}:
                      </span>
                      <p className="font-semibold text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  📝 Next Step:
                </h3>
                <p className="text-sm text-yellow-800">
                  Update the <code className="bg-yellow-100 px-1 rounded">parseMeasurements</code> function 
                  in <code className="bg-yellow-100 px-1 rounded">MLMeasurementCapture.tsx</code> to match this response format.
                </p>
              </div>
            </div>
          )}

          {/* API Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">API Information:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ML Model URL:</span>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  http://164.52.214.147:7000/predict
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next.js API Route:</span>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  /api/ml/predict
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  POST (multipart/form-data)
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}