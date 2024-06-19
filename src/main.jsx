import ReactDOM from 'react-dom/client'
import { SocketProvider } from './SocketContext'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store";
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
    <SocketProvider>
      <App />
      </SocketProvider>
    </QueryClientProvider>
    </Provider>
);
