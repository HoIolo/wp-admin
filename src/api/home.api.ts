import { ApiResponse } from "@/types/common";
import http from "../utils/http";
import { HomeData, VisitorData } from "@/types/home";

const PREFIX = "/api/v1";

export const getHomeDetail = () => {
  return http.get<ApiResponse<HomeData>>(PREFIX + "/backstage/home");
};

export const getVisitorRange = (startDate: string, endDate: string) => {
  return http.get<ApiResponse<VisitorData[]>>(
    PREFIX + `/website/visitor/range?startDate=${startDate}&endDate=${endDate}`
  );
};
