import React from "react";

export const Label = ({
  children,
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={"block text-gray-400 text-xs mb-1 " + className}
    {...props}
  >
    {children}
  </label>
);

export default Label;