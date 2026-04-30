import { useSelectOptions } from "@/shared/hooks/useSelectOptions";

export const useLeadSources = (queryOptions = {}) => {
  const { options: sources, isLoading } = useSelectOptions("lead_source", queryOptions);
  return { sources, isLoading };
};
