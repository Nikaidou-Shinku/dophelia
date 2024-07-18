import { createMemo, createSignal, For, Show } from "solid-js";
import { createScheduled, debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { NovelInfo, ThanatosVersion } from "~/data/interface";

declare const APP_VERSION: string;
declare const GIT_HASH: string;

export default () => {
  const [keyword, setKeyword] = createSignal("");

  const scheduled = createScheduled((fn) => debounce(fn, 500));
  const debouncedKeyword = createMemo((prev: string = "") => {
    const value = keyword();
    return scheduled() ? value : prev;
  });

  const versionQuery = createQuery(() => ({
    queryKey: ["version"],
    queryFn: async () => {
      const resp = await fetch("/api/version");
      const res: ThanatosVersion = await resp.json();
      return res;
    },
  }));

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
    <div class="flex h-[100dvh] w-[100dvw] flex-col items-center">
      <div class="flex flex-1 flex-col items-center justify-center space-y-2">
        <h1 class="text-2xl">菠萝包更新统计</h1>
        <input
          class="rounded border px-2 py-1 shadow-inner"
          placeholder="输入关键字搜索…"
          onInput={(e) => setKeyword(e.currentTarget.value)}
          value={keyword()}
        />
        <div class="flex flex-col">
          <For each={searchQuery.data}>
            {(novel) => (
              <A
                class="border-b px-4 py-2 hover:bg-gray-100"
                href={`/novels/${novel.id}`}
              >
                {novel.title} - {novel.author.name}
              </A>
            )}
          </For>
        </div>
      </div>
      <div class="flex flex-col items-center">
        <span>Powered by</span>
        <span>
          <a
            class="text-blue-600 hover:text-blue-500"
            href="https://github.com/Nikaidou-Shinku/thanatos"
            target="_blank"
          >
            Thanatos
          </a>
          <Show
            when={versionQuery.isSuccess}
          >{` v${versionQuery.data!.version} (${versionQuery.data!.gitHash.slice(0, 7)})`}</Show>
        </span>
        <span>
          <a
            class="text-blue-600 hover:text-blue-500"
            href="https://github.com/Nikaidou-Shinku/dophelia"
            target="_blank"
          >
            Dophelia
          </a>
          {` v${APP_VERSION} (${GIT_HASH.slice(0, 7)})`}
        </span>
      </div>
    </div>
  );
};
