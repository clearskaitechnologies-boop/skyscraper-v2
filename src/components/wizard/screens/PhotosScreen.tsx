import { Camera, Upload, X } from "lucide-react";
import React, { useState } from "react";

import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

export const PhotosScreen: React.FC = () => {
  const { jobData, updateJobData, completeStep } = useWizardStore();
  const [photos, setPhotos] = useState<string[]>(jobData.photos || []);

  const canProgress = photos.length > 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateJobData({ photos });
    completeStep("photos");
  };

  return (
    <WizardScreen onNext={handleNext} canProgress={canProgress}>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Camera className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Photos</h2>
            <p className="text-gray-600">Add photos of the damage (min 1 required)</p>
          </div>
        </div>

        {/* Upload Button */}
        <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200 hover:border-green-500 hover:bg-green-50">
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Upload className="mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, HEIC up to 10MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
          />
        </label>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="group relative">
                <img
                  src={photo}
                  alt={`Upload ${index + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <p className="text-center text-sm text-green-600">
            ✓ {photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded
          </p>
        )}
      </div>
    </WizardScreen>
  );
};
