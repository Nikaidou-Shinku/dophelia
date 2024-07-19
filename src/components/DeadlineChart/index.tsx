import { createMemo, onMount } from "solid-js";
import dayjs from "dayjs";
import { Chart, Colors, LinearScale, Title, Tooltip } from "chart.js";
import { Bar } from "solid-chartjs";
import { ChapterInfo } from "~/data/interface";

interface DeadlineChartProps {
  data: ChapterInfo[];
  ignoreUpdate: boolean;
  width: number;
  height: number;
}

const counter = (time: dayjs.Dayjs): number | null => {
  if (time.hour() === 23) {
    for (let i = 1; i < 12; ++i) {
      if (time.minute() < i * 5) {
        return i - 1;
      }
    }

    return 11;
  } else if (time.hour() === 0) {
    for (let i = 1; i < 12; ++i) {
      if (time.minute() < i * 5) {
        return i + 11;
      }
    }

    return 23;
  }

  return null;
};

export default (props: DeadlineChartProps) => {
  onMount(() => {
    Chart.register(Colors, LinearScale, Title, Tooltip);
  });

  const source = createMemo(() => {
    const res = Array(24).fill(0);

    for (const chapter of props.data) {
      const time = dayjs.tz(
        props.ignoreUpdate
          ? chapter.createTime
          : (chapter.updateTime ?? chapter.createTime),
        "Asia/Shanghai",
      );

      const pos = counter(time);

      if (pos !== null) {
        res[pos] += 1;
      }
    }

    return res;
  });

  const chartData = () => ({
    labels: Array.from(Array(24).keys()).map(
      (i) => `${i < 12 ? "23" : "00"}:${`0${(i * 5) % 60}`.slice(-2)}`,
    ),
    datasets: [
      {
        label: "更新章节数",
        data: source(),
        borderWidth: 1,
        backgroundColor: [
          ...Array(12).fill("rgba(54, 162, 235, 0.5)"),
          ...Array(12).fill("rgba(255, 99, 132, 0.5)"),
        ],
        borderColor: [
          ...Array(12).fill("rgb(54, 162, 235)"),
          ...Array(12).fill("rgb(255, 99, 132)"),
        ],
      },
    ],
  });

  return (
    <Bar
      data={chartData()}
      options={{
        plugins: {
          title: {
            display: true,
            text: "人离死线越近，死线离人越近",
            font: { size: 16 },
          },
          tooltip: {
            intersect: false,
          },
        },
      }}
      width={props.width}
      height={props.height}
    />
  );
};
