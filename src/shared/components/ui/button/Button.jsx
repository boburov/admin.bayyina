// Hooks
import useSound from "@/shared/hooks/useSound";

// Components
import { Button as ButtonComponent } from "@/shared/components/shadcn/button";

const Button = ({ children, ...props }) => {
  const { playSound } = useSound();
  return (
    <ButtonComponent
      {...props}
      onClick={(e) => {
        props?.onClick(e);
        playSound("click-button");
      }}
    >
      {children}
    </ButtonComponent>
  );
};

export default Button;
