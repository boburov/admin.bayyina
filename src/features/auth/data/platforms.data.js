// Animations
import {
  gcapEmojiAnimation,
  adminEmojiAnimation,
  teacherEmojiAnimation,
} from "@/shared/assets/animations";

const platforms = [
  {
    name: "Admin",
    isCurrent: true,
    animationData: adminEmojiAnimation,
  },
  {
    name: "O'qituvchi",
    isCurrent: false,
    animationData: teacherEmojiAnimation,
    href: "https://teacher.bayyina.uz",
  },
  {
    name: "O'quvchi",
    isCurrent: false,
    animationData: gcapEmojiAnimation,
    href: "https://student.bayyina.uz",
  }
];

export default platforms;
