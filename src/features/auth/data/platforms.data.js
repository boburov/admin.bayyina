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
    href: "https://teacher.studytrack.uz",
  },
  {
    name: "O'quvchi",
    isCurrent: false,
    animationData: gcapEmojiAnimation,
    href: "https://student.studytrack.uz",
  },
];

export default platforms;
