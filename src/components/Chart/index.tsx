import { createMemo, onMount } from "solid-js";
import dayjs from "dayjs";
import { Chart, Colors, LinearScale, Tooltip } from "chart.js";
import { Bar } from "solid-chartjs";
import { ChapterInfo } from "~/data/interface";

interface ChartProps {
  data: ChapterInfo[];
  ignoreUpdate: boolean;
  width: number;
  height: number;
}

export default (props: ChartProps) => {
  onMount(() => {
    Chart.register(Colors, LinearScale, Tooltip);
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
      res[time.hour()] += 1;
    }

    return res;
  });

  const chartData = () => ({
    labels: Array.from(Array(24).keys()).map((i) => `${i}:00`),
    datasets: [
      {
        label: "更新章节数",
        data: source(),
        borderWidth: 1,
      },
    ],
  });

  return <Bar data={chartData()} width={props.width} height={props.height} />;
};
