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
import { AppSidebarDesktop, AppSidebarMobile } from "@/shared/components/layout/AppSidebar";

// Modals
import EditUserModal from "@/features/users/components/EditUserModal";
import EditClassModal from "@/features/classes/components/EditClassModal";
import CreateUserModal from "@/features/users/components/CreateUserModal";
import DeleteUserModal from "@/features/users/components/DeleteUserModal";
import ExportUsersModal from "@/features/users/components/ExportUsersModal";
import CreateClassModal from "@/features/classes/components/CreateClassModal";
import DeleteClassModal from "@/features/classes/components/DeleteClassModal";
import SendNotificationModal from "@/features/notifications/components/SendNotificationModal";
import NotificationDetailModal from "@/features/notifications/components/NotificationDetailModal";
import ViewUserPasswordModal from "@/features/users/components/ViewUserPasswordModal";
import ResetUserPasswordModal from "@/features/users/components/ResetUserPasswordModal";
import StudentStatisticsModal from "@/features/statistics/components/StudentStatisticsModal";
import BugReport from "../components/layout/BugReport";

const DashboardLayout = () => {
  actions();

  return (
    <>
      {/* Main */}
      <div className="flex h-screen overflow-hidden bg-gray-50 relative z-10">
        {/* Desktop sidebar */}
        <AppSidebarDesktop />

        {/* Mobile sidebar + toggle */}
        <AppSidebarMobile />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile top spacing so content doesn't hide under toggle btn */}
          <div className="lg:hidden h-14" />
          <div className="px-4 py-5 lg:px-6 space-y-5">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Bug Report */}
      <BugReport />

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

      {/* Notification Modals */}
      <SendNotificationModal />
      <NotificationDetailModal />

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
