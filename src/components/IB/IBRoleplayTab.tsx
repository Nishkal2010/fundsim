import React from "react";
import { RoleplayLanding } from "../FinFox/RoleplayLanding";
import { getScenario } from "../../lib/roleplayScenarios";

export function IBRoleplayTab() {
  return <RoleplayLanding scenario={getScenario("ib")} />;
}
