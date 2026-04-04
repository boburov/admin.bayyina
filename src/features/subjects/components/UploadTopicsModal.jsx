// Toast
import { toast } from "sonner";

// API
import { topicsAPI } from "@/features/subjects/api/topics.api";

// React
import { useState, useRef } from "react";

// Components
import Select from "@/shared/components/form/select";
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { X, FileSpreadsheet } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

const UploadTopicsModal = () => (
  <ResponsiveModal name="uploadTopics" title="Mavzular yuklash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: subjects } = useArrayStore("subjects");
  const { invalidateCache } = useArrayStore("topics");

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { state, setField } = useObjectState({
    uploadMode: "all",
    subjectId: "",
  });

  // Upload mode options
  const uploadModeOptions = [
    { value: "all", label: "Barcha fanlar (Ko'p sahifali Excel)" },
    { value: "single", label: "Bitta fan" },
  ];

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Validate and set file
  const validateAndSetFile = (file) => {
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx")) {
      toast.error("Faqat .xlsx formatdagi fayllar qabul qilinadi");
      return;
    }

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Fayl hajmi juda katta. Maksimal 20MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Iltimos, Excel faylni tanlang");
      return;
    }

    if (state.uploadMode === "single" && !state.subjectId) {
      toast.error("Iltimos, fanni tanlang");
      return;
    }

    setIsLoading(true);

    try {
      const subjectIdParam =
        state.uploadMode === "single" ? state.subjectId : null;
      const response = await topicsAPI.upload(selectedFile, subjectIdParam);

      toast.success(response.data.message);

      // Show warnings if any
      if (response.data.data?.errors && response.data.data.errors.length > 0) {
        response.data.data.errors.forEach((error, index) => {
          if (index < 3) {
            // Show only first 3 errors
            toast.warning(error);
          }
        });
      }

      // Invalidate cache
      invalidateCache();

      // Close modal and notify listeners
      close({
        uploadedAt: Date.now(),
        uploadMode: state.uploadMode,
        subjectId: subjectIdParam,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Mavzularni yuklashda xatolik";
      toast.error(errorMessage);

      // Show detailed errors if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err, index) => {
          if (index < 3) {
            // Show only first 3 errors
            toast.error(err);
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload Mode */}
      <Select
        label="Yuklash usuli"
        value={state.uploadMode}
        onChange={(value) => {
          setField("uploadMode", value);
          setField("subjectId", "");
        }}
        options={uploadModeOptions}
        required
      />

      {/* Subject Selection (only for single mode) */}
      {state.uploadMode === "single" && (
        <Select
          label="Fan"
          value={state.subjectId}
          onChange={(value) => setField("subjectId", value)}
          options={subjects.map((subject) => ({
            label: subject.name,
            value: subject._id,
          }))}
          required
        />
      )}

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excel fayl <span className="text-red-500">*</span>
        </label>

        {!selectedFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <FileSpreadsheet
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-600 mb-1">
              Excel faylni bu yerga tashlang yoki
            </p>
            <p className="text-sm font-medium text-blue-600">
              Faylni tanlash uchun bosing
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Faqat .xlsx formatdagi fayllar (maksimal 20MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet
                  className="h-8 w-8 text-green-600"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Excel fayl formati:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {state.uploadMode === "all" ? (
            <>
              <li>• Har bir sahifa (sheet) - bitta fan</li>
              <li>• Sahifa nomi - fan nomi bilan bir xil bo'lishi kerak</li>
              <li>• Ustunlar: T/R, Mavzu nomi, Tavsif</li>
            </>
          ) : (
            <>
              <li>• Faqat birinchi sahifa (sheet) o'qiladi</li>
              <li>• Ustunlar: T/R, Mavzu nomi, Tavsif</li>
            </>
          )}
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="neutral"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          variant="primary"
          className="w-full xs:w-32"
          disabled={isLoading || !selectedFile}
        >
          Yuklash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default UploadTopicsModal;
