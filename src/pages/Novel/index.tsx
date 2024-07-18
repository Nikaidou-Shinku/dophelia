import { createSignal, Match, Show, Switch } from "solid-js";
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

  return (
    <div class="flex justify-center p-8">
      <div class="flex flex-col items-center space-y-4">
        <div class="flex w-full rounded-lg border">
          <Switch>
            <Match when={novelQuery.isPending}>
              <div class="w-full py-24 text-center">
                <span class="text-2xl">Loading...</span>
              </div>
            </Match>
            <Match when={novelQuery.isError}>
              <div class="w-full py-24 text-center">
                <span class="text-2xl">出问题了！{`${novelQuery.error}`}</span>
              </div>
            </Match>
            <Match when={novelQuery.isSuccess}>
              <div class="basis-1/4">
                <img class="rounded-l-lg" src={novelQuery.data!.cover} />
              </div>
              <div class="flex basis-3/4 flex-col space-y-2 p-4">
                <div class="flex items-end justify-between">
                  <h1 class="text-2xl">{novelQuery.data!.title}</h1>
                  <span class="text-sm text-gray-400">
                    #{novelQuery.data!.id}
                  </span>
                </div>
                <div>作者：{novelQuery.data!.author.name}</div>
                <div>字数：{novelQuery.data!.charCount} 字</div>
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
            <div class="flex space-x-4">
              <div class="flex flex-col justify-around rounded-lg border p-4">
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
              <div class="rounded-lg border p-4">
                <Heatmap
                  data={chaptersQuery.data!}
                  currentYear={year()}
                  ignoreUpdate={true}
                />
              </div>
            </div>
            <div>
              <Chart data={chaptersQuery.data!} ignoreUpdate={true} />
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  );
};
