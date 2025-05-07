import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { createScheduled, debounce } from "@solid-primitives/scheduled";
import { useQuery } from "@tanstack/solid-query";
import { A, useParams } from "@solidjs/router";
import { NovelInfo } from "~/data/interface";
import { PLATFORM_NAMES, PLATFORMS } from "~/data/constants";

export default () => {
  const params = useParams();

  const [keyword, setKeyword] = createSignal("");

  const scheduled = createScheduled((fn) => debounce(fn, 500));
  const debouncedKeyword = createMemo((prev: string = "") => {
    const value = keyword();
    return scheduled() ? value : prev;
  });

  const searchQuery = useQuery(() => ({
    queryKey: ["search", params.platform, debouncedKeyword().trim()],
    queryFn: async (props) => {
      const key = props.queryKey[2] as string;

      if (key === "") {
        return [];
      }

      const resp = await fetch(
        `/api/${props.queryKey[1]}/search?keyword=${key}`,
      );
      const res: NovelInfo[] = await resp.json();
      return res;
    },
  }));

  return (
    <div class="flex flex-1 flex-col items-center">
      <div class="flex w-4/5 flex-1 flex-col items-center justify-center">
        <h1 class="text-3xl">
          {PLATFORM_NAMES[params.platform as (typeof PLATFORMS)[number]]}
          更新统计
        </h1>
        <input
          class="mt-8 h-12 w-full max-w-96 rounded border border-gray-200 px-4 py-2 text-lg shadow-inner"
          placeholder="输入关键字搜索…"
          onInput={(e) => setKeyword(e.currentTarget.value)}
          value={keyword()}
        />
        <div class="mt-4 flex w-full max-w-96 flex-col">
          <Switch>
            <Match when={searchQuery.isPending}>
              <span class="text-center">搜索中……</span>
            </Match>
            <Match when={searchQuery.isError}>
              <span class="text-center">
                出问题了！{`${searchQuery.error}`}
              </span>
            </Match>
            <Match when={searchQuery.isSuccess}>
              <Show
                when={
                  debouncedKeyword().trim() === "" ||
                  searchQuery.data!.length > 0
                }
                fallback={<span class="text-center">什么都没有找到！</span>}
              >
                <For each={searchQuery.data}>
                  {(novel) => (
                    <A
                      class="flex flex-col border-b border-gray-200 px-4 py-2 hover:bg-gray-100"
                      href={`/${params.platform}/${novel.id}`}
                    >
                      <span>{novel.title}</span>
                      <span class="text-sm text-gray-400">{novel.author}</span>
                    </A>
                  )}
                </For>
              </Show>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};
