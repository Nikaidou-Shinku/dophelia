import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { createScheduled, debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { NovelInfo } from "~/data/interface";

export default () => {
  const [keyword, setKeyword] = createSignal("");

  const scheduled = createScheduled((fn) => debounce(fn, 500));
  const debouncedKeyword = createMemo((prev: string = "") => {
    const value = keyword();
    return scheduled() ? value : prev;
  });

  const searchQuery = createQuery(() => ({
    queryKey: ["search", debouncedKeyword().trim()],
    queryFn: async (props) => {
      const key = props.queryKey[1] as string;

      if (key === "") {
        return [];
      }

      const resp = await fetch(`/api/search?keyword=${key}`);
      const res: NovelInfo[] = await resp.json();
      return res;
    },
  }));

  return (
    <div class="flex flex-1 flex-col items-center">
      <div class="flex w-4/5 flex-1 flex-col items-center justify-center">
        <h1 class="text-3xl">菠萝包更新统计</h1>
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
                      href={`/novels/${novel.id}`}
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
