import { JSX, Show } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import { ThanatosVersion } from "~/data/interface";

declare const APP_VERSION: string;
declare const GIT_HASH: string;

interface AppProps {
  children?: JSX.Element;
}

export default (props: AppProps) => {
  const versionQuery = createQuery(() => ({
    queryKey: ["version"],
    queryFn: async () => {
      const resp = await fetch("/api/version");
      const res: ThanatosVersion = await resp.json();
      return res;
    },
  }));

  return (
    <div class="flex h-dvh flex-col gap-y-4">
      <div class="border-b border-gray-200 bg-gray-100 px-6 py-3">
        <A class="text-blue-600 hover:text-blue-500" href="/">
          Dophelia
        </A>
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
