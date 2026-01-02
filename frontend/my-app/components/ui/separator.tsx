import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export const Separator: React.FC<SeparatorProps> = ({ className = "", ...props }) => (
  <hr className={"border-t border-gray-200 my-2 " + className} {...props} />
);

export default Separator;
