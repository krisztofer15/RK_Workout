import * as React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const Dumbbell = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={props.size || 24}
    height={props.size || 24}
    fill="none"
    stroke={props.color || "currentColor"}
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Bal oldali fogantyú */}
    <Rect x="2" y="9" width="3" height="6" rx="1.5" />
    {/* Jobb oldali fogantyú */}
    <Rect x="19" y="9" width="3" height="6" rx="1.5" />
    {/* Súlyzórúd */}
    <Rect x="5" y="11" width="14" height="2" rx="1" />
    {/* Súlyok */}
    <Rect x="4" y="8" width="1.5" height="8" rx="0.75" />
    <Rect x="18.5" y="8" width="1.5" height="8" rx="0.75" />
  </Svg>
);

export default Dumbbell;
