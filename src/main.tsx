import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { MockupClasificacion } from "./features/responsables/component/MockupClasificacion";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <MockupClasificacion />
    </>
  </React.StrictMode>
);
