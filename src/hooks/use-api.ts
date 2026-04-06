import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api } from "@/services/api";

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api.get<T>(endpoint),
    ...options,
  });
}

export function useApiMutation<T, TVariables = unknown>(
  endpoint: string,
  method: "post" | "put" | "delete" = "post",
) {
  return useMutation<T, Error, TVariables>({
    mutationFn: (variables) => {
      if (method === "delete") {
        return api.delete<T>(endpoint);
      }
      return api[method]<T>(endpoint, variables);
    },
  });
}
