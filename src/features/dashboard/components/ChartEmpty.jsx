import { BarChart2 } from "lucide-react";

const ChartEmpty = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
    <BarChart2 className="size-7 text-slate-200" strokeWidth={1.5} />
    <p className="text-xs text-slate-400">Ma'lumot mavjud emas</p>
  </div>
);

export default ChartEmpty;