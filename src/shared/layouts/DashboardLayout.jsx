// React
import { useEffect } from "react";

// Router
import { Outlet } from "react-router-dom";

// API
import { usersAPI } from "@/shared/api/users.api";
import { classesAPI } from "@/shared/api/classes.api";
import { holidaysAPI } from "@/shared/api/holidays.api";
import { subjectsAPI } from "@/shared/api/subjects.api";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectStore from "@/shared/hooks/useObjectStore";

// Components
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/shadcn/sidebar";
import AppHeader from "@/shared/components/layout/AppHeader";
import AppSidebar from "@/shared/components/layout/AppSidebar";

// Modals
import EditUserModal from "@/features/users/components/EditUserModal";
import EditClassModal from "@/features/classes/components/EditClassModal";
import CreateUserModal from "@/features/users/components/CreateUserModal";
import DeleteUserModal from "@/features/users/components/DeleteUserModal";
import ExportUsersModal from "@/features/users/components/ExportUsersModal";
import CreateClassModal from "@/features/classes/components/CreateClassModal";
import DeleteClassModal from "@/features/classes/components/DeleteClassModal";
import EditSubjectModal from "@/features/subjects/components/EditSubjectModal";
import SendMessageModal from "@/features/messages/components/SendMessageModal";
import EditScheduleModal from "@/features/schedules/components/EditScheduleModal";
import UploadTopicsModal from "@/features/subjects/components/UploadTopicsModal";
import CreateSubjectModal from "@/features/subjects/components/CreateSubjectModal";
import DeleteSubjectModal from "@/features/subjects/components/DeleteSubjectModal";
import DeleteProductModal from "@/features/market/components/DeleteProductModal";
import MessageDetailsModal from "@/features/messages/components/MessageDetailsModal";
import CreateScheduleModal from "@/features/schedules/components/CreateScheduleModal";
import DeleteScheduleModal from "@/features/schedules/components/DeleteScheduleModal";
import ViewUserPasswordModal from "@/features/users/components/ViewUserPasswordModal";
import ResetUserPasswordModal from "@/features/users/components/ResetUserPasswordModal";
import UpdateOrderStatusModal from "@/features/market/components/UpdateOrderStatusModal";
import StudentStatisticsModal from "@/features/statistics/components/StudentStatisticsModal";

const DashboardLayout = () => {
  actions();

  return (
    <>
      {/* Main */}
      <SidebarProvider className="relative z-10">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 px-4 py-2">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Background Patterns */}
      <BackgroundPatterns />

      {/* User Modals */}
      <EditUserModal />
      <DeleteUserModal />
      <CreateUserModal />
      <ResetUserPasswordModal />
      <ViewUserPasswordModal />
      <ExportUsersModal />

      {/* Class Modals */}
      <EditClassModal />
      <CreateClassModal />
      <DeleteClassModal />

      {/* Subject Modals */}
      <EditSubjectModal />
      <CreateSubjectModal />
      <DeleteSubjectModal />

      {/* Schedule Modals */}
      <EditScheduleModal />
      <CreateScheduleModal />
      <DeleteScheduleModal />

      {/* Message Modals */}
      <SendMessageModal />
      <MessageDetailsModal />

      {/* Topic Modals */}
      <UploadTopicsModal />

      {/* Market */}
      <DeleteProductModal />
      <UpdateOrderStatusModal />

      {/* Stats */}
      <StudentStatisticsModal />
    </>
  );
};

const actions = () => {
  const { user } = useAuth();

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore();

  const isOwner = user?.role === "owner";
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const { addEntity, hasEntity } = useObjectStore("holidayCheck");

  // Initialize collection (pagination = false)
  useEffect(() => {
    if (!hasCollection("classes")) initialize(false, "classes");
    if (!hasCollection("subjects")) initialize(false, "subjects");
    if (!hasCollection("teachers")) initialize(false, "teachers");
  }, [initialize, hasCollection]);

  const fetchClasses = () => {
    setCollectionLoadingState(true, "classes");

    classesAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "classes");
      })
      .catch(() => {
        setCollectionErrorState(true, "classes");
      });
  };

  const fetchSubjects = () => {
    setCollectionLoadingState(true, "subjects");

    subjectsAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "subjects");
      })
      .catch(() => {
        setCollectionErrorState(true, "subjects");
      });
  };

  const fetchTeachers = () => {
    setCollectionLoadingState(true, "teachers");

    usersAPI
      .getAll({ role: "teacher", limit: 200 })
      .then((res) => {
        setCollection(res.data.data, null, "teachers");
      })
      .catch(() => {
        setCollectionErrorState(true, "teachers");
      });
  };

  const checkTodayHoliday = () => {
    holidaysAPI
      .checkToday()
      .then((res) => addEntity("today", res.data.data))
      .catch(() => {
        addEntity("today", { isHoliday: false, holiday: null });
      });
  };

  useEffect(() => {
    !classes?.length && fetchClasses();
    !subjects?.length && fetchSubjects();
    !teachers?.length && isOwner && fetchTeachers();
    if (!hasEntity("today")) checkTodayHoliday();
  }, [classes?.length, subjects?.length, teachers?.length]);
};

const BackgroundPatterns = () => (
  <>
    {/* Grid */}
    <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

    {/* Blue Circle */}
    <div className="fixed left-0 right-0 top-[-10%] z-0 m-auto h-[300px] w-[300px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />

    {/* Indigo Circle */}
    <div className="fixed bottom-[-10%] left-[-10%] z-0 h-[300px] w-[300px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />

    {/* Purple Circle */}
    <div className="fixed top-[20%] right-[-5%] z-0 h-[250px] w-[250px] rounded-full bg-purple-500 opacity-20 blur-[100px]" />
  </>
);

export default DashboardLayout;
