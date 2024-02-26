import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
// import Helmet from "react-helmet"

import { Home, About, Leaders } from './pages';
import './styles/main.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <h1>Something went wrong</h1>,
  },
  {
    path: "/notaboutus",
    element: <About />,
    errorElement: <h1>Something went wrong</h1>,
  },
  {
    path: "/leaders",
    element: <Leaders />,
    errorElement: <h1>Something went wrong</h1>,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);