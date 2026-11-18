import { parseVolcanoStatus } from "../../utils/statusParser.js";

function StatusBadge({ status }) {
  const parsed = parseVolcanoStatus(status);
  return <span className={`status-badge is-${parsed.tone}`}>{parsed.label}</span>;
}

export default StatusBadge;