// Toast
import { toast } from "sonner";

// Icons
import { Upload, X } from "lucide-react";

// React
import { useEffect, useState, useRef } from "react";

// API
import { usersAPI } from "@/shared/api/users.api";
import { classesAPI } from "@/shared/api/classes.api";
import { messagesAPI } from "@/shared/api/messages.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const SendMessageModal = () => (
  <ResponsiveModal name="sendMessage" title="Xabar yuborish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { invalidateCache } = useArrayStore("messages");
  const { invalidateCache: invalidateTeacherMessages } =
    useArrayStore("teacherMessages");

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { state, setField } = useObjectState({
    messageText: "",
    recipientType: "class",
    classId: "",
    studentId: "",
  });

  // Recipient type options
  const recipientTypeOptions = [
    { value: "all", label: "Barchaga" },
    { value: "class", label: "Sinfga" },
    { value: "student", label: "O'quvchiga" },
  ];

  // Load classes
  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => {
        setClasses(res.data.data || []);
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xato");
      });
  }, []);

  // Load students when class or recipientType changes
  useEffect(() => {
    if (state.recipientType === "student") {
      const params = { role: "student", limit: 200 };
      if (state.classId) {
        params.class = state.classId;
      }

      usersAPI
        .getAll(params)
        .then((res) => {
          setStudents(res.data.data || []);
        })
        .catch(() => {
          toast.error("O'quvchilarni yuklashda xato");
        });
    }
  }, [state.recipientType, state.classId]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Fayl hajmi juda katta. Maksimal 20MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    // Validate message text
    if (!state.messageText || !state.messageText.trim()) {
      return toast.warning("Xabar matni majburiy");
    }

    // Validate recipient type
    if (state.recipientType === "class" && !state.classId) {
      return toast.warning("Sinf tanlanishi kerak");
    }

    if (state.recipientType === "student" && !state.studentId) {
      return toast.warning("O'quvchi tanlanishi kerak");
    }

    setIsLoading(true);

    const data = {
      messageText: state.messageText.trim(),
      recipientType: state.recipientType,
    };

    if (state.classId && state.recipientType === "class") {
      data.classId = state.classId;
    }

    if (state.studentId && state.recipientType === "student") {
      data.studentId = state.studentId;
    }

    if (selectedFile) {
      data.file = selectedFile;
    }

    messagesAPI
      .send(data)
      .then(() => {
        close();
        invalidateCache();
        invalidateTeacherMessages();
        toast.success("Xabar navbatga qo'shildi va tez orada yuboriladi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <InputGroup onSubmit={handleSendMessage} as="form">
      {/* Message Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Xabar matni <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          maxLength={2048}
          value={state.messageText}
          placeholder="Xabar matnini kiriting..."
          onChange={(e) => setField("messageText", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {state.messageText.length}/2048
        </div>
      </div>

      {/* Recipient Type */}
      <SelectField
        required
        label="Kimga yuborish"
        options={recipientTypeOptions}
        value={state.recipientType}
        onChange={(v) => {
          setField("classId", "");
          setField("studentId", "");
          setField("recipientType", v);
        }}
      />

      {/* Class Selection*/}
      {(state.recipientType === "class" ||
        state.recipientType === "student") && (
        <SelectField
          required
          label="Sinf"
          value={state.classId}
          placeholder="Sinf tanlang"
          onChange={(v) => {
            setField("classId", v);

            if (state.recipientType === "student") {
              setField("studentId", "");
            }
          }}
          options={classes.map((c) => ({
            value: c._id,
            label: c.name,
          }))}
        />
      )}

      {/* Student Selection (if recipientType is student) */}
      {state.recipientType === "student" && (
        <SelectField
          required
          label="O'quvchi"
          value={state.studentId}
          placeholder="O'quvchi tanlang"
          onChange={(v) => setField("studentId", v)}
          options={students.map((s) => ({
            value: s._id,
            label: s.fullName,
          }))}
        />
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Fayl yoki rasm (ixtiyoriy)
        </label>
        <div className="space-y-2">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="size-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Fayl yuklash uchun bosing</p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF, PDF, DOC, XLS (Max 20MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded">
                  <Upload className="size-5 text-blue-600" />
                </div>
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
                onClick={removeFile}
                className="text-red-600 hover:text-red-900"
              >
                <X className="size-5" />
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yuborish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default SendMessageModal;
