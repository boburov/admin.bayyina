// Hooks
import useSound from "@/shared/hooks/useSound";

// Components
import { Button as ButtonComponent } from "@/shared/components/shadcn/button";

const Button = ({ children, playClickSound = true, ...props }) => {
  const { playSound } = useSound();

  const handleClick = (e) => {
    props.onClick?.(e);
    playClickSound && playSound("click-button");
  };

  return (
    <ButtonComponent {...props} onClick={handleClick}>
      {children}
    </ButtonComponent>
  );
};

export default Button;
