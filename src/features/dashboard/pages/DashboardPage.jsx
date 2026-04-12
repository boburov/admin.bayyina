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
