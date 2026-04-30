import { useQuery } from "@tanstack/react-query";
import { selectOptionsAPI } from "@/shared/api/selectOptions.api";

/**
 * Fetch select options for a given type from /select-options?type=X
 * Returns { options, isLoading, isError }
 * Each option: { _id, value, label }
 */
export const useSelectOptions = (type, queryOptions = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey:  ["select-options", type],
    queryFn:   () => selectOptionsAPI.getOptions(type).then((r) => r.data),
    staleTime: 5 * 60_000, // 5 min — options rarely change
    enabled:   !!type,
    ...queryOptions,
  });

  return {
    options:   data?.options ?? [],
    isLoading,
    isError,
  };
};
