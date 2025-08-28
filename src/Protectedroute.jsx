import React from 'react';
import { Navigate } from 'react-router-dom';

const Protectedroute = ({isAdmin, children}) => {
  return isAdmin ? children : <Navigate to ="/" />;
};

export default Protectedroute;
