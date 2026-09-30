import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await loginUser(email.trim(), password);

            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);

            navigate("/dashboard");
        } catch (error) {
            setError(error.message || "Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-shell" aria-label="Sign in to Tripwise">
                <aside className="login-visual">
                    <div className="login-brand">
                        <span className="brand-mark" aria-hidden="true">
                            T
                        </span>
                        <span>Tripwise</span>
                    </div>

                    <div className="travel-art" aria-hidden="true">
                        <div className="art-sun" />
                        <div className="art-hill art-hill-back" />
                        <div className="art-hill art-hill-front" />

                        <div className="art-route">
                            <span className="route-dot route-dot-start" />
                            <span className="route-dot route-dot-end" />
                        </div>

                        <div className="art-card">
                            <span className="art-card-icon">✦</span>
                            <span>
                                <strong>Your next adventure</strong>
                                <small>Starts with a plan</small>
                            </span>
                        </div>
                    </div>

                    <div className="login-visual-copy">
                        <p className="visual-eyebrow">
                            MAKE ROOM FOR THE JOURNEY
                        </p>

                        <h2>Plan less. Explore more.</h2>

                        <p>
                            Bring your trips, plans, and travel budget together
                            in one place.
                        </p>
                    </div>

                    <span className="visual-footer">
                        Your journey, thoughtfully planned.
                    </span>
                </aside>

                <div className="login-content">
                    <div className="login-form-wrap">
                        <div className="login-heading">
                            <p className="login-eyebrow">WELCOME BACK</p>

                            <h1>Sign in to Tripwise</h1>

                            <p>
                                Enter your details to continue planning your
                                journey.
                            </p>
                        </div>

                        {location.state?.registered && (
                            <p className="login-success" role="status">
                                Account created successfully. You can now sign
                                in.
                            </p>
                        )}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="login-field">
                                <label htmlFor="login-email">
                                    Email address
                                </label>

                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <input
                                    id="login-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="login-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                className="login-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}

                                {!loading && (
                                    <span aria-hidden="true">→</span>
                                )}
                            </button>
                        </form>

                        <p className="login-note">
                            Don't have an account?{" "}
                            <Link to="/register">Create one</Link>
                        </p>
                    </div>

                    <div className="login-bottom">
                        <span>© {new Date().getFullYear()} Tripwise</span>
                        <span>Plan your journey with confidence.</span>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;