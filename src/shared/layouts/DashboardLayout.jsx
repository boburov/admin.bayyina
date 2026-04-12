// React
import { useEffect } from "react";

// Router
import { Outlet } from "react-router-dom";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { rolesAPI } from "@/features/roles/api/roles.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { holidaysAPI } from "@/features/holidays/api/holidays.api";

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
import MainBackgroundPatterns from "../components/bg/MainBackgroundPatterns";

// Modals
import EditUserModal from "@/features/users/components/EditUserModal";
import EditClassModal from "@/features/classes/components/EditClassModal";
import CreateUserModal from "@/features/users/components/CreateUserModal";
import DeleteUserModal from "@/features/users/components/DeleteUserModal";
import ExportUsersModal from "@/features/users/components/ExportUsersModal";
import CreateClassModal from "@/features/classes/components/CreateClassModal";
import DeleteClassModal from "@/features/classes/components/DeleteClassModal";
import SendMessageModal from "@/features/messages/components/SendMessageModal";
import MessageDetailsModal from "@/features/messages/components/MessageDetailsModal";
import ViewUserPasswordModal from "@/features/users/components/ViewUserPasswordModal";
import ResetUserPasswordModal from "@/features/users/components/ResetUserPasswordModal";
import StudentStatisticsModal from "@/features/statistics/components/StudentStatisticsModal";
import BugReport from "../components/layout/BugReport";

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

      {/* Bug Report */}
      <BugReport />

      {/* Background Patterns */}
      <MainBackgroundPatterns />

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

      {/* Message Modals */}
      <SendMessageModal />
      <MessageDetailsModal />

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
  const roles = getCollectionData("roles");
  const classes = getCollectionData("classes");
  const teachers = getCollectionData("teachers");

  const { addEntity, hasEntity } = useObjectStore("holidayCheck");

  // Initialize collection (pagination = false)
  useEffect(() => {
    if (!hasCollection("roles")) initialize(false, "roles");
    if (!hasCollection("classes")) initialize(false, "classes");
    if (!hasCollection("teachers")) initialize(false, "teachers");
  }, [initialize, hasCollection]);

  const fetchRoles = () => {
    setCollectionLoadingState(true, "roles");

    rolesAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "roles");
      })
      .catch(() => {
        setCollectionErrorState(true, "roles");
      });
  };

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
    !roles?.length && isOwner && fetchRoles();
    !classes?.length && fetchClasses();
    !teachers?.length && isOwner && fetchTeachers();
    if (!hasEntity("today")) checkTodayHoliday();
  }, [roles?.length, classes?.length, teachers?.length]);
};

export default DashboardLayout;
