import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer, Slide } from "react-toastify"
import { X } from "lucide-react"
import { queryClient } from "./lib/queryClient"
import { routes } from "./routes"
import "react-toastify/dist/ReactToastify.css"

const router = createBrowserRouter(routes)

// White ✕ — readable on the black toast background in every theme/type.
function ToastCloseButton({ closeToast }) {
	return (
		<button
			type="button"
			onClick={closeToast}
			aria-label="Dismiss notification"
			className="ml-auto self-center p-0.5 text-white/80 transition hover:text-white"
		>
			<X className="h-4 w-4" strokeWidth={3} />
		</button>
	)
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ToastContainer
				position="top-right"
				transition={Slide}
				newestOnTop
				closeButton={ToastCloseButton}
			/>
		</QueryClientProvider>
	)
}

export default App
