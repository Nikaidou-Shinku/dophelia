import { createMemo, createSignal, For } from "solid-js";
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
    <div class="flex h-[calc(100dvh-121px)] w-dvw flex-col items-center">
      <div class="flex w-4/5 flex-1 flex-col items-center justify-center space-y-8">
        <h1 class="text-3xl">菠萝包更新统计</h1>
        <input
          class="h-12 w-full max-w-96 rounded border px-4 py-2 text-lg shadow-inner"
          placeholder="输入关键字搜索…"
          onInput={(e) => setKeyword(e.currentTarget.value)}
          value={keyword()}
        />
        <div class="flex w-full max-w-96 flex-col">
          <For each={searchQuery.data}>
            {(novel) => (
              <A
                class="flex flex-col border-b px-4 py-2 hover:bg-gray-100"
                href={`/novels/${novel.id}`}
              >
                <span>{novel.title}</span>
                <span class="text-sm text-gray-400">{novel.author.name}</span>
              </A>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
