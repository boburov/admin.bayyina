import { useSelectOptions } from "@/shared/hooks/useSelectOptions";

export const useCourseTypes = (queryOptions = {}) => {
  const { options: courseTypes, isLoading } = useSelectOptions("course_type", queryOptions);
  return { courseTypes, isLoading };
};
