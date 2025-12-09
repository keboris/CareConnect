import UseNotifications from "./UseNotifications";

const NotificationManager = ({ userId }: { userId: string }) => {
  const { permission, requestPermission } = UseNotifications({ userId });

  return (
    <div>
      {permission !== "granted" && (
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Activer les notifications
        </button>
      )}
    </div>
  );
};

export default NotificationManager;
