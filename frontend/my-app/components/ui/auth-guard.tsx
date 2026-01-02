import React from "react";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // You can add real auth logic here later
  return <>{children}</>;
};

export default AuthGuard;