"use client";

import useSWR from "swr";
import { api } from "../lib/api";

export default function useGoals() {
  const fetcher = (url: string) => api.get(url).then(res => res.data);
  return useSWR("/goals", fetcher);
}
