import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Submit from "./screens/Submit";
import Leaderboard from "./screens/Leaderboard";
import Signup from "./screens/Signup";
import { TeamProvider, useTeam } from "./context/TeamContext";
import { ToastContainer, Bounce } from "react-toastify";
import PoweredByVroom from "./components/PoweredByVroom";
// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { teamName } = useTeam();
    return teamName ? children : <Navigate to="/signup" />;
};

const App = () => {
    return (
        <div className="app">
            <TeamProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Submit />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/leaderboard"
                            element={
                                <ProtectedRoute>
                                    <Leaderboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <PoweredByVroom />
                </BrowserRouter>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    transition={Bounce}
                    stacked={true}
                />
            </TeamProvider>
        </div>
    );
};

export default App;
