import { createBrowserRouter } from "react-router-dom";

import { LayoutPrincipal, LayoutAdministracion } from "../layouts";
import { ContabilidadPage, RankingPage, ClasificacionPage } from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutPrincipal />,
    children: [
      {
        index: true,
        element: <ClasificacionPage />,
      },
      {
        path: "administracion",
        element: <LayoutAdministracion />,
        children: [
          {
            path: "residuos",
            element: <h1>Adios mundo</h1>,
          },
          {
            path: "usuarios",
            element: <h1>Hola mundo</h1>,
          },
        ],
      },
      {
        path: "ranking",
        element: <RankingPage />,
      },
      {
        path: "contabilidad",
        element: <ContabilidadPage />,
      },
    ],
  },
  {
    path: "*",
    element: <h1>Página no encontrada</h1>,
  },
]);
