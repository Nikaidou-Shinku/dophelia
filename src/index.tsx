/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Route, Router } from "@solidjs/router";
import "./index.css";

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
