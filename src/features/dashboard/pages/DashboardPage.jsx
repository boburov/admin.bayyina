// Lottie
import Lottie from "lottie-react";

// Icons
import { Download } from "lucide-react";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";

// Components
import Card from "@/shared/components/ui/Card";
import CoinStats from "../components/CoinStats";
import UsersStats from "../components/UsersStats";
import HolidayInfo from "../components/HolidayInfo";
import PenaltyStats from "../components/PenaltyStats";
import AllSchedulesToday from "../components/AllSchedulesToday";

// Utils
import { getTimedRandomAnimation } from "@/shared/utils/animations.utils";

const Dashboard = () => {
  const { user } = useAuth();
  const { openModal } = useModal();

  const { animation } = getTimedRandomAnimation({
    family: "duck",
    sentiment: ["positive", "playful"],
  });

  return (
    <div>
      {/* Top Bar */}
      <div className="flex gap-4 mb-4">
        {/* Greetings */}
        <Card className="flex items-center gap-1.5 !py-3 grow md:gap-3">
          <Lottie className="size-6 sm:size-7" animationData={animation} />

          <h2 className="text-xl leading-none font-bold text-gray-900">
            Xush kelibsiz, {user?.fullName}!
          </h2>
        </Card>

        {/* Download button
        <button
          onClick={() => openModal("downloadApp")}
          className="flex items-center gap-4 h-auto bg-blue-100 text-blue-500 rounded-xl pl-4 overflow-hidden font-medium text-sm"
        >
          Ilovani yuklab olish
          <span className="flex items-center justify-center bg-blue-500 text-white h-full px-4">
            <Download className="size-5" strokeWidth={1.5} />
          </span>
        </button> */}
      </div>

      {/* Holiday Info */}
      <HolidayInfo />

      {/* User Statistics - Owner only */}
      <UsersStats />

      {/* Coin Statistics - Owner only */}
      <CoinStats />

      {/* Penalty Statistics - Owner only */}
      {/* <PenaltyStats /> */}

      {/* Today's Schedules */}
      <AllSchedulesToday />

      {/* Download App Modal */}
      {/* <DownloadAppModal /> */}
    </div>
  );
};

export default Dashboard;
