import * as React from "react";
import * as Strings from "~/common/strings";
import * as Constants from "~/common/constants";
import * as System from "~/components/system";

import { css } from "@emotion/react";

import Section from "~/components/core/Section";
import ScenePage from "~/components/core/ScenePage";
import ScenePageHeader from "~/components/core/ScenePageHeader";

let mounted = false;

export default class SceneSentinel extends React.Component {
  state = { routes: [] };

  async componentDidMount() {
    if (mounted) {
      return null;
    }

    mounted = true;

    let routes;
    try {
      const response = await fetch("https://sentinel.slate.host/api");
      const json = await response.json();
      routes = json.data;
    } catch (e) {}

    this.setState({ routes });
  }

  componentWillUnmount() {
    mounted = false;
  }

  render() {
    return (
      <ScenePage>
        <ScenePageHeader title="Network API">
          Slate provides access to recent data on the Filecoin Network through Sentinel. Each of
          these API endpoints can be used programatically.
        </ScenePageHeader>

        <Section title="Filecoin API routes" style={{ maxWidth: 960, minWidth: "auto" }}>
          <System.Table
            data={{
              columns: [
                {
                  key: "route",
                  name: "Route",
                  width: "100%",
                  name: "URL",
                  type: "NEW_WINDOW",
                },
              ],
              rows: this.state.routes.map((r) => {
                const route = `https://sentinel.slate.host${r}?offset=0&limit=200`;
                return {
                  route,
                };
              }),
            }}
          />
        </Section>
      </ScenePage>
    );
  }
}
