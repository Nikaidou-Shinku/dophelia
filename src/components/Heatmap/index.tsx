import { createEffect, createMemo, onCleanup } from "solid-js";
import { createMediaQuery } from "@solid-primitives/media";
import dayjs from "dayjs";
// @ts-ignore
import CalHeatmap from "cal-heatmap";
// @ts-ignore
import Tooltip from "cal-heatmap/plugins/Tooltip";
// @ts-ignore
import Legend from "cal-heatmap/plugins/Legend";
import { ChapterInfo } from "~/data/interface";
import "cal-heatmap/cal-heatmap.css";
import "./styles.css";

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
      date: dayjs
        .tz(
          props.ignoreUpdate
            ? chapter.createTime
            : (chapter.updateTime ?? chapter.createTime),
          // NOTE: match the UTC time zone that cal-heatmap cannot change
          "Etc/UTC",
        )
        .toISOString(),
      value: chapter.charCount,
    })),
  );

  const rawData = createMemo(() => {
    const result: { [date: string]: ChapterInfo[] } = {};

    for (const chapter of props.data) {
      const date = dayjs
        .tz(
          props.ignoreUpdate
            ? chapter.createTime
            : (chapter.updateTime ?? chapter.createTime),
          "Etc/UTC",
        )
        .format("YYYY-MM-DD");

      if (typeof result[date] === "undefined") {
        result[date] = [];
      }

      result[date].push(chapter);
    }

    return result;
  });

  const calendarOptions = () => {
    const data = calData();

    return {
      itemSelector: divRef,
      domain: {
        type: "month",
        label: { position: "top", height: screenLarge() ? 25 : 48 },
      },
      subDomain: screenLarge()
        ? { type: "day" }
        : { type: "xDay", gutter: 8, width: 24, height: 24, radius: 8 },
      date: {
        start: new Date(props.currentYear, 1),
        min: data[0].date,
        max: data[data.length - 1].date,
        locale: {
          months:
            "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split(
              "_",
            ),
        },
        // NOTE: this seems unchangeable
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

  onCleanup(() => cal.destroy());

  createEffect(() => {
    cal.paint(calendarOptions(), [
      [
        Tooltip,
        {
          text: (_timestamp: number, value: number, dayjsDate: any) => {
            const date = dayjsDate.format("YYYY-MM-DD");
            const chapters = rawData()[date];

            if (typeof chapters === "undefined") {
              return `${date} | ${value}字`;
            }

            let result = `<div><div>${date} | ${value}字</div>`;

            for (const chapter of chapters) {
              const time = dayjs
                .tz(
                  props.ignoreUpdate
                    ? chapter.createTime
                    : (chapter.updateTime ?? chapter.createTime),
                  "Etc/UTC",
                )
                .format("HH:mm:ss");

              result += `<div>${time}「${chapter.title}」${chapter.charCount}字</div>`;
            }

            result += "</div>";
            return result;
          },
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

  return (
    <div ref={divRef} class="flex flex-col items-center lg:flex-col-reverse">
      <div
        ref={legendRef}
        class="mb-8 flex justify-center lg:mb-0 lg:mt-4"
      ></div>
    </div>
  );
};
