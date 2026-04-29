// React
import { useEffect } from "react";

// Router
import { Outlet } from "react-router-dom";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

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
  const {
    initialize,
    hasCollection,
    setCollection,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore();

  const classes = useArrayStore().getCollectionData("classes");

  useEffect(() => {
    if (!hasCollection("classes")) initialize(false, "classes");
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

  useEffect(() => {
    if (!classes?.length) fetchClasses();
  }, [classes?.length]);
};

export default DashboardLayout;
