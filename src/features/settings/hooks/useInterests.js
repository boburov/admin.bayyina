import { useSelectOptions } from "@/shared/hooks/useSelectOptions";

export const useInterests = (queryOptions = {}) => {
  const { options: interests, isLoading } = useSelectOptions("interest_type", queryOptions);
  return { interests, isLoading };
};
