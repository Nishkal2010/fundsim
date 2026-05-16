import React from "react";
import { RoleplayLanding } from "../FinFox/RoleplayLanding";
import { getScenario } from "../../lib/roleplayScenarios";

export function VCRoleplayTab() {
  return <RoleplayLanding scenario={getScenario("vc")} />;
}
