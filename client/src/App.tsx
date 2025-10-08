import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages/IndexPage";
import { StudentOnBoardPage } from "./pages/StudentOnBoardPage";
import { RoomPage } from "./pages/RoomPage";
import PollHistoryPage from "./pages/PollHistoryPage";
import { SocketProvider } from "./context/socketContext";
import { Provider } from "react-redux";
import { store } from "./store";
import { KickOut } from "./components/kickOut";

function App() {
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  return (
    <BrowserRouter>
      <Provider store={store}>
        <SocketProvider serverUrl={serverUrl}>
          <Routes>
            <Route index element={<IndexPage />} />
            <Route path="/student-onboard" element={<StudentOnBoardPage />} />
            <Route path="/room" element={<RoomPage />} />
            <Route path="/history" element={<PollHistoryPage />} />
            <Route path="/kick-out" element={<KickOut />} />
          </Routes>
        </SocketProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
