import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

import { Error, Home, About, Leaders, SignUp, Register, Guide, Dashboard, Login, Logout } from './pages';
import { AuthPage } from './components';
import './styles/main.css';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/notaboutus",
    element: <About />,
    errorElement: <Error />,
  },
  {
    path: "/leaders",
    element: <Leaders />,
    errorElement: <Error />,
  },
  {
    path: "/signup",
    element: <SignUp />,
    errorElement: <Error />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <Error />,
  },
  {
    path: "/guide",
    element: <Guide />,
    errorElement: <Error />,
  },
  {
    path: "/logout",
    element: <Logout />,
    errorElement: <Error />,
  },
  {
    path: "/dashboard",
    element: (
      <AuthPage>
        <Dashboard />
      </AuthPage>
    ),
    errorElement: <Error />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);