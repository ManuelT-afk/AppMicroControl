
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Inicializa Firebase al arrancar (servicios disponibles en toda la app)
import "./lib/firebase";

createRoot(document.getElementById("root")!).render(<App />);
