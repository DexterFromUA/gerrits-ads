import { createBrowserRouter } from "react-router-dom";

import { Home, Category, Login } from '../pages'

export default createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'collection/:id',
    element: <Category />
  },
  {
    path: 'login',
    element: <Login />
  }
])
