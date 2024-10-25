import { createSignal, Match, Show, Switch } from "solid-js";
import { createMediaQuery } from "@solid-primitives/media";
import { createWindowSize } from "@solid-primitives/resize-observer";
import dayjs from "dayjs";
import { createQuery } from "@tanstack/solid-query";
import { A, useParams } from "@solidjs/router";
import { ChapterInfo, NovelInfo } from "~/data/interface";
import { Chart, DeadlineChart, Heatmap } from "~/components";

export default () => {
  const params = useParams();

  const novelQuery = createQuery(() => ({
    queryKey: ["novels", params.id],
    queryFn: async (props) => {
      const resp = await fetch(`/api/novels/${props.queryKey[1]}`);
      const res: NovelInfo = await resp.json();
      return res;
    },
  }));

  const chaptersQuery = createQuery(() => ({
    queryKey: ["novels", params.id, "chapters"],
    queryFn: async (props) => {
      const resp = await fetch(`/api/novels/${props.queryKey[1]}/chapters`);
      const res: ChapterInfo[] = await resp.json();
      return res;
    },
  }));

  const latestChapterTime = () => {
    if (!chaptersQuery.isSuccess) {
      return null;
    }

    const source = chaptersQuery.data
      .filter((c) => c.charCount >= 1000)
      .map((c) => dayjs.tz(c.updateTime ?? c.createTime, "Asia/Shanghai"));

    return dayjs.max(source);
  };

  const [year, setYear] = createSignal(dayjs().year());

  const windowSize = createWindowSize();
  const screenLarge = createMediaQuery("(min-width: 1024px)");
  const chartWidth = () => (screenLarge() ? 918 : windowSize.width - 64);

  return (
    <div class="flex justify-center px-4">
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
              <Show
                when={novelQuery.data}
                fallback={
                  <div class="flex w-full flex-col space-y-4 px-24 py-12 text-center">
                    <span class="text-2xl">这本书不存在！</span>
                    <A class="text-blue-600 hover:text-blue-500" href="/">
                      返回主页
                    </A>
                  </div>
                }
              >
                {(novel) => (
                  <>
                    <div class="basis-2/5 lg:basis-1/4">
                      <img class="lg:rounded-l-lg" src={novel().cover} />
                    </div>
                    <div class="flex basis-3/5 flex-col space-y-2 p-4 lg:basis-3/4">
                      <div class="flex items-end justify-between">
                        <h1 class="text-2xl">{novel().title}</h1>
                        <span class="hidden text-sm text-gray-400 lg:block">
                          #{novel().id}
                        </span>
                      </div>
                      <span>作者：{novel().author.name}</span>
                      <span>字数：{novel().charCount} 字</span>
                      <div class="space-x-2">
                        <Show
                          when={novel().isFinish}
                          fallback={
                            <>
                              <span class="rounded bg-green-600 px-2 py-1 text-sm text-white">
                                连载中
                              </span>
                              <Show when={latestChapterTime()}>
                                {(t) => (
                                  <span class="text-gray-400">
                                    作者已经 {t().toNow(true)}
                                    没有更新了，生产队的驴都不敢这么歇！
                                  </span>
                                )}
                              </Show>
                            </>
                          }
                        >
                          <span class="rounded bg-blue-600 px-2 py-1 text-white">
                            已完结
                          </span>
                        </Show>
                      </div>
                    </div>
                  </>
                )}
              </Show>
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
            <Show when={chaptersQuery.data!.length > 0}>
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
                <div class="flex-1 rounded-lg border p-8 lg:p-4">
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
                height={screenLarge() ? 320 : chartWidth() / 2}
              />
              <DeadlineChart
                data={chaptersQuery.data!}
                ignoreUpdate={true}
                width={chartWidth()}
                height={screenLarge() ? 320 : chartWidth() / 2}
              />
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  );
};
