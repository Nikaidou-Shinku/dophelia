import { createEffect, createMemo, onCleanup } from "solid-js";
// @ts-ignore
import CalHeatmap from "cal-heatmap";
// @ts-ignore
import Tooltip from "cal-heatmap/plugins/Tooltip";
// @ts-ignore
import Legend from "cal-heatmap/plugins/Legend";
import { ChapterInfo } from "~/data/interface";
import "cal-heatmap/cal-heatmap.css";

interface HeatmapProps {
  data: ChapterInfo[];
  currentYear: number;
  ignoreUpdate: boolean;
}

export default (props: HeatmapProps) => {
  let divRef: HTMLDivElement | undefined;

  const calData = createMemo(() =>
    props.data.map((chapter) => ({
      date: props.ignoreUpdate
        ? chapter.createTime
        : (chapter.updateTime ?? chapter.createTime),
      value: chapter.charCount,
    })),
  );

  const calendarOptions = () => {
    const data = calData();

    return {
      itemSelector: divRef,
      domain: { type: "month" },
      subDomain: { type: "day" },
      date: {
        start: new Date(props.currentYear, 1),
        min: data[0].date,
        max: data[data.length - 1].date,
        locale: "zh",
      },
      data: {
        source: data,
        x: "date",
        y: "value",
        defaultValue: 0,
      },
      scale: {
        color: {
          scheme: "Greens",
          domain: [0, 10000],
          type: "linear",
        },
      },
    };
  };

  const cal = new CalHeatmap();

  createEffect(() => {
    cal.paint(calendarOptions(), [
      [
        Tooltip,
        {
          text: (_timestamp: number, value: number, dayjsDate: any) =>
            `${dayjsDate.format("YYYY-MM-DD")} | ${value}字`,
        },
      ],
      [Legend, { label: "每日更新字数" }],
    ]);
  });

  onCleanup(() => cal.destroy());

  return <div ref={divRef}></div>;
};
