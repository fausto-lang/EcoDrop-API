import { createBrowserRouter } from "react-router-dom";

import { LayoutPrincipal, LayoutAdministracion } from "../layouts";
import {
  ContabilidadPage,
  RankingPage,
  ClasificacionPage,
  AdministracionResiduos,
  AdministracionUsuarios,
} from "../pages";

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
            element: <AdministracionResiduos />,
          },
          {
            path: "usuarios",
            element: <AdministracionUsuarios />,
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
