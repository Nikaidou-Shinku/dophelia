/* @refresh reload */
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "./index.css";

const Home = lazy(() => import("~/pages/Home"));

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  ),
  document.getElementById("root")!,
);
