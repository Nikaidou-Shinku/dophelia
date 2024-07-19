/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import minMax from "dayjs/plugin/minMax";
import relativeTime from "dayjs/plugin/relativeTime";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Route, Router } from "@solidjs/router";
import "./index.css";

dayjs.locale("zh-cn");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);
dayjs.extend(relativeTime);

const Novel = lazy(() => import("~/pages/Novel"));
const Home = lazy(() => import("~/pages/Home"));

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route
          path="/novels/:id"
          component={Novel}
          matchFilters={{ id: /^\d+$/ }}
        />
        <Route path="/" component={Home} />
      </Router>
    </QueryClientProvider>
  ),
  document.getElementById("root")!,
);
