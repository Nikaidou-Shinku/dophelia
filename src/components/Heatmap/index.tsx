import { createEffect, createMemo, onCleanup } from "solid-js";
import { createMediaQuery } from "@solid-primitives/media";
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
  let legendRef: HTMLDivElement | undefined;

  const screenLarge = createMediaQuery("(min-width: 1024px)");

  const calData = createMemo(() =>
    props.data.map((chapter) => ({
      date: `${
        props.ignoreUpdate
          ? chapter.createTime
          : (chapter.updateTime ?? chapter.createTime)
      }Z`,
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
        timezone: "Etc/UTC",
      },
      data: {
        source: data,
        x: "date",
        y: "value",
        defaultValue: 0,
      },
      verticalOrientation: !screenLarge(),
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
      [
        Legend,
        {
          itemSelector: legendRef,
          label: "每日更新字数",
        },
      ],
    ]);
  });

  onCleanup(() => cal.destroy());

  return (
    <div ref={divRef} class="flex flex-col items-center lg:flex-col-reverse">
      <div
        ref={legendRef}
        class="mb-4 flex justify-center lg:mb-0 lg:mt-2"
      ></div>
    </div>
  );
};
