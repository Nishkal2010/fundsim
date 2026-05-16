import React from "react";
import { RoleplayLanding } from "../FinFox/RoleplayLanding";
import { getScenario } from "../../lib/roleplayScenarios";

export function PERoleplayTab() {
  return <RoleplayLanding scenario={getScenario("pe")} />;
}
