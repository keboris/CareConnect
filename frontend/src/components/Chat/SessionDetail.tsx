import { motion, AnimatePresence } from "framer-motion";
import type { HelpSessionProps } from "../../types";

const SessionDetail = ({
  sessions,
  setIsShowDetails,
}: {
  sessions: HelpSessionProps[];
  setIsShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full mt-0 left-0 w-full max-h-80 overflow-y-auto border border-gray-200 bg-white shadow-lg rounded-md z-50 p-2"
        onMouseEnter={() => setIsShowDetails(true)} // <-- important
        onMouseLeave={() => setIsShowDetails(false)}
      >
        <p className="font-semibold text-gray-800">
          <span className="ml-1 font-normal text-gray-500 cursor-pointer underline">
            ({sessions.length} sessions)
          </span>
        </p>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {sessions.map((s, index) => (
            <div
              key={s._id || index}
              className="border-b last:border-none pb-2"
            >
              <p className="text-sm font-medium">
                Session #{index + 1} —{" "}
                <span
                  className={`${
                    s.status === "active"
                      ? "text-green-600"
                      : s.status === "completed"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {s.status}
                </span>
              </p>

              <p className="text-xs text-gray-600">Option : {s.option}</p>

              <p className="text-xs text-gray-600">
                Start : {new Date(s.startedAt).toLocaleString()}
              </p>

              {s.endedAt &&
                (s.status === "completed" || s.status === "cancelled") && (
                  <>
                    <p className="text-xs text-gray-600">
                      End : {new Date(s.endedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Finalized by : {s.final}
                    </p>
                  </>
                )}

              {s.lastMessage && (
                <p className="text-xs text-gray-700 mt-1">
                  Last message :{" "}
                  <span className="italic">
                    {s.lastMessage.content.slice(0, 40)}
                    {s.lastMessage.content.length > 40 ? "..." : ""}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionDetail;
