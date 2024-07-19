import { createSignal, Match, Show, Switch } from "solid-js";
import { createMediaQuery } from "@solid-primitives/media";
import { createWindowSize } from "@solid-primitives/resize-observer";
import { createQueries } from "@tanstack/solid-query";
import { useParams } from "@solidjs/router";
import { ChapterInfo, NovelInfo } from "~/data/interface";
import { Chart, Heatmap } from "~/components";

export default () => {
  const params = useParams();

  const [novelQuery, chaptersQuery] = createQueries(() => ({
    queries: [
      {
        queryKey: ["novels", params.id],
        queryFn: async (props) => {
          const resp = await fetch(`/api/novels/${props.queryKey[1]}`);
          const res: NovelInfo = await resp.json();
          return res;
        },
      },
      {
        queryKey: ["novels", params.id, "chapters"],
        queryFn: async (props) => {
          const resp = await fetch(`/api/novels/${props.queryKey[1]}/chapters`);
          const res: ChapterInfo[] = await resp.json();
          return res;
        },
      },
    ],
  }));

  const [year, setYear] = createSignal(new Date().getFullYear());

  const windowSize = createWindowSize();
  const screenLarge = createMediaQuery("(min-width: 1024px)");
  const chartWidth = () => (screenLarge() ? 918 : windowSize.width - 64);

  return (
    <div class="flex justify-center p-8">
      <div class="flex flex-col items-center space-y-4">
        <div class="flex w-full items-center rounded-lg border lg:items-start">
          <Switch>
            <Match when={novelQuery.isPending}>
              <div class="w-full py-12 text-center">
                <span class="text-2xl">Loading...</span>
              </div>
            </Match>
            <Match when={novelQuery.isError}>
              <div class="w-full py-12 text-center">
                <span class="text-2xl">出问题了！{`${novelQuery.error}`}</span>
              </div>
            </Match>
            <Match when={novelQuery.isSuccess}>
              <div class="basis-2/5 lg:basis-1/4">
                <img class="lg:rounded-l-lg" src={novelQuery.data!.cover} />
              </div>
              <div class="flex basis-3/5 flex-col space-y-2 p-4 lg:basis-3/4">
                <div class="flex items-end justify-between">
                  <h1 class="text-2xl">{novelQuery.data!.title}</h1>
                  <span class="hidden text-sm text-gray-400 lg:block">
                    #{novelQuery.data!.id}
                  </span>
                </div>
                <span>作者：{novelQuery.data!.author.name}</span>
                <span>字数：{novelQuery.data!.charCount} 字</span>
                <div>
                  <Show
                    when={novelQuery.data!.isFinish}
                    fallback={
                      <span class="rounded bg-green-600 px-2 py-1 text-white">
                        连载中
                      </span>
                    }
                  >
                    <span class="rounded bg-blue-600 px-2 py-1 text-white">
                      已完结
                    </span>
                  </Show>
                </div>
              </div>
            </Match>
          </Switch>
        </div>
        <Switch>
          <Match when={chaptersQuery.isPending}>
            <div class="w-full border py-24 text-center">
              <span class="text-2xl">Loading...</span>
            </div>
          </Match>
          <Match when={chaptersQuery.isError}>
            <div class="w-full border py-24 text-center">
              <span class="text-2xl">出问题了！{`${chaptersQuery.error}`}</span>
            </div>
          </Match>
          <Match when={chaptersQuery.isSuccess}>
            <div class="flex w-full flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
              <div class="flex items-center justify-around space-x-2 rounded-lg border p-4 lg:flex-col lg:space-x-0">
                <button
                  class="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 active:bg-gray-400"
                  onClick={() => setYear((y) => y - 1)}
                >
                  上一年
                </button>
                <span class="text-xl font-bold">{year()} 年</span>
                <button
                  class="rounded bg-gray-200 px-2 py-1 hover:bg-gray-300 active:bg-gray-400"
                  onClick={() => setYear((y) => y + 1)}
                >
                  下一年
                </button>
              </div>
              <div class="flex-1 rounded-lg border p-4">
                <Heatmap
                  data={chaptersQuery.data!}
                  currentYear={year()}
                  ignoreUpdate={true}
                />
              </div>
            </div>
            <Chart
              data={chaptersQuery.data!}
              ignoreUpdate={true}
              width={chartWidth()}
              height={screenLarge() ? 340 : chartWidth() / 2}
            />
          </Match>
        </Switch>
      </div>
    </div>
  );
};
