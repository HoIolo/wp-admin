import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/title";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/legend";
import "echarts/lib/component/grid";

import {
  BookOutlined,
  CommentOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";

import style from "./index.module.scss";
import { confirmWhite } from "@/utils/common.util";
import whiteList from "@/config/whiteList.config";
import { useLocation } from "react-router-dom";
import MyContent from "@/content";
import { getHomeDetail, getVisitorRange } from "@/api/home.api";
import { HomeData, VisitorData } from "@/types/home";
import dayjs from "dayjs";

const Home: React.FC = () => {
  const location = useLocation();
  let lineWrap = useRef<HTMLDivElement>(null);
  const isInWhiteList = confirmWhite(
    whiteList,
    "pathWhiteList",
    location.pathname
  );
  const [statistics, setStatistics] = useState<HomeData>();
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [chartDays, setChartDays] = useState<string[]>([]);
  const [chartCounts, setChartCounts] = useState<number[]>([]);

  // 获取当前周的开始日期（周一）和结束日期（周日）
  const getCurrentWeekDateRange = () => {
    const current = dayjs();
    // 获取本周的周一
    const startOfWeek = current.startOf('week');
    // 如果一周从周日开始，则移动到周一
    const startDate = startOfWeek.day() === 0 ? startOfWeek.add(1, 'day') : startOfWeek;
    // 获取本周的周日
    const endDate = startDate.add(6, 'day');

    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    };
  };

  async function getHomeData() {
    const { data: res } = await getHomeDetail();
    if (res.code === 1001) {
      setStatistics(res.data?.row);
    }
  }

  async function getWeeklyVisitorData() {
    const { startDate, endDate } = getCurrentWeekDateRange();
    try {
      const { data: res } = await getVisitorRange(startDate, endDate);
      if (res.code === 1001 && res.data) {
        // 将返回的数据保存到状态
        const visitorArray = Array.isArray(res.data) ? res.data : [];
        setVisitorData(visitorArray);

        // 处理图表数据
        const days: string[] = [];
        const counts: number[] = [];

        // 创建日期->数据的映射
        const dataMap = new Map<string, number>();
        visitorArray.forEach((item: VisitorData) => {
          dataMap.set(item.date, item.count);
        });

        // 生成一周的每一天
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const daysDiff = end.diff(start, 'day') + 1;

        for (let i = 0; i < daysDiff; i++) {
          const date = start.add(i, 'day');
          const formattedDate = date.format('YYYY-MM-DD');
          const dayDisplay = date.format('ddd'); // 显示为 Mon, Tue 等

          days.push(dayDisplay);
          counts.push(dataMap.get(formattedDate) || 0);
        }

        setChartDays(days);
        setChartCounts(counts);
      }
    } catch (error) {
      console.error("获取访问记录失败", error);
    }
  }

  useEffect(() => {
    getHomeData();
    getWeeklyVisitorData();
  }, []);

  useEffect(() => {
    if (!lineWrap.current || chartDays.length === 0) return;

    let myCharts = echarts.init(lineWrap.current);

    myCharts.setOption({
      title: {
        text: "网站本周流量",
        textStyle: {
          color: "#000",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#fff",
          },
        },
      },
      legend: {
        data: ["访问数量"],
        textStyle: {
          color: "#000",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: chartDays,
        },
      ],
      yAxis: [
        {
          type: "value",
        },
      ],
      series: [
        {
          name: "访问数量",
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          data: chartCounts,
        },
      ],
    });

    window.addEventListener("resize", () => {
      myCharts.resize();
    });

    return () => {
      window.removeEventListener("resize", () => {
        myCharts.resize();
      });
      myCharts.dispose();
    };
  }, [chartDays, chartCounts, isInWhiteList]);

  const cardMap = [
    {
      id: 1,
      icon: (
        <UserOutlined className="md:text-4xl lg:text-5xl" style={{ color: '#1890ff' }} rev={undefined} />
      ),
      title: "用户数量",
      num: statistics?.userTotal,
    },
    {
      id: 2,
      icon: (
        <BookOutlined className="md:text-4xl lg:text-5xl" style={{ color: '#52c41a' }} rev={undefined} />
      ),
      title: "文章数量",
      num: statistics?.articleTotal,
    },
    {
      id: 3,
      icon: (
        <CommentOutlined className="md:text-4xl lg:text-5xl" style={{ color: '#fa8c16' }} rev={undefined} />
      ),
      title: "评论数量",
      num: statistics?.commentTotal,
    },
    {
      id: 4,
      icon: (
        <CommentOutlined className="md:text-4xl lg:text-5xl" style={{ color: '#722ed1' }} rev={undefined} />
      ),
      title: "标签数量",
      num: statistics?.tagTotal,
    },
    {
      id: 5,
      icon: <EyeOutlined className="md:text-4xl lg:text-5xl" style={{ color: '#f5222d' }} rev={undefined} />,
      title: "网站访问量",
      num: statistics?.visitorTotal,
    },
  ];

  return (
    <MyContent.Consumer>
      {() => {
        return (
          <div className={style.home}>
            <div className={style.top_card}>
              {cardMap.map((item) => {
                return (
                  <div className={style.card} key={item.id}>
                    <div className="icon">{item.icon}</div>
                    <div className={style.info}>
                      <div className={style.info_title}>
                        <span className="md:text-sm lg:text-lg">
                          {item.title}
                        </span>
                      </div>
                      <div className={style.info_num}>
                        <span>{item.num}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className={style.lineCharts}
              ref={lineWrap}
              style={{ width: "100%", height: "400px" }}
            ></div>
          </div>
        );
      }}
    </MyContent.Consumer>
  );
};

export default Home;
