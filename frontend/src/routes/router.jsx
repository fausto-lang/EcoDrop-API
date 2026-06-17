import { createBrowserRouter } from "react-router-dom";

import { LayoutPrincipal } from "../layouts/LayoutPrincipal";
import {
  AdministracionPage,
  ContabilidadPage,
  RankingPage,
  ClasificacionPage,
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
        element: <AdministracionPage />,
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
    element: <h1>Pagina no encontrada</h1>,
  },
]);
