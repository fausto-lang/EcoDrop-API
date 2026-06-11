import { createBrowserRouter } from "react-router-dom";

import { LayoutPrincipal } from "../layouts/LayoutPrincipal";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutPrincipal />,
    children: [
      {
        index: true,
        element: <h1>Clasificacion</h1>,
      },
      {
        path: "administracion",
        element: <h1>Administracion</h1>,
      },
      {
        path: "ranking",
        element: <h1>Ranking</h1>,
      },
    ],
  },
  {
    path: "*",
    element: <h1>Pagina no encontrada</h1>,
  },
]);
