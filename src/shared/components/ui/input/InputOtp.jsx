// Components
import {
  InputOTPSlot,
  InputOTPGroup,
  InputOTP as InputOTPComponent,
} from "../../shadcn/input-otp";

// Utils
import { cn } from "@/shared/utils/cn";

// Digigits RegExp
import { REGEXP_ONLY_DIGITS } from "input-otp";

const InputOtp = ({ className = "", ...props }) => {
  return (
    <InputOTPComponent
      maxLength={5}
      className={cn(className)}
      pattern={REGEXP_ONLY_DIGITS}
      {...props}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
      </InputOTPGroup>
    </InputOTPComponent>
  );
};

export default InputOtp;
