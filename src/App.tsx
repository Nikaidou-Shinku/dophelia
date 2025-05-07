import { For, JSX, Show } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { ThanatosVersion } from "~/data/interface";
import { PLATFORM_NAMES, PLATFORMS } from "~/data/constants";

declare const APP_VERSION: string;
declare const GIT_HASH: string;

interface AppProps {
  children?: JSX.Element;
}

export default (props: AppProps) => {
  const versionQuery = useQuery(() => ({
    queryKey: ["version"],
    queryFn: async () => {
      const resp = await fetch("/api/version");
      const res: ThanatosVersion = await resp.json();
      return res;
    },
  }));

  return (
    <div class="flex h-dvh flex-col gap-y-4">
      <div class="flex gap-x-8 border-b border-gray-200 bg-gray-100 px-6 py-3">
        <For each={PLATFORMS}>
          {(platform) => (
            <A class="text-blue-600 hover:text-blue-500" href={`/${platform}`}>
              {PLATFORM_NAMES[platform]}
            </A>
          )}
        </For>
      </div>
      {props.children}
      <div class="flex flex-col items-center">
        <span>Powered by</span>
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
      </div>
    </div>
  );
};
