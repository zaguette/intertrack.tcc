import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "./context/AppContext";
import { router } from "./routes";

export default function App() {
  return (
    <AppProvider>
      <Toaster richColors position="top-right" duration={3000} />
      <RouterProvider router={router} />
    </AppProvider>
  );
}
