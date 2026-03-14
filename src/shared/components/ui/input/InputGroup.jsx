// Utils
import { cn } from "@/shared/utils/cn";

const InputGroup = ({ children, className = "" }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-5", className)}>{children}</div>
  );
};

export default InputGroup;
