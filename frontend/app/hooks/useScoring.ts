"use client";

import useSWR from "swr";
import { api } from "../lib/api";

export default function useScoring() {
  const fetcher = (url: string) => api.get(url).then(res => res.data);
  return useSWR("/scoring", fetcher);
}