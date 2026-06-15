import { createBrowserRouter } from "react-router-dom";

import { LayoutPrincipal } from "../layouts/LayoutPrincipal";
import Ranking from "./Ranking";
import Contabilidad from "./Contabilidad";

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
        element: <Ranking />,
      },
      {
        path: "contabilidad",
        element: <Contabilidad />,
      },
    ],
  },
  {
    path: "*",
    element: <h1>Pagina no encontrada</h1>,
  },
]);
