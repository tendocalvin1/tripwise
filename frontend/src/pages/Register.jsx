import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import "./Login.css";

function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                password,
            });

            navigate("/login", {
                state: { registered: true },
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-shell" aria-label="Create a Tripwise account">
                <aside className="login-visual">
                    <div className="login-brand">
                        <span className="brand-mark" aria-hidden="true">T</span>
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
                        <p className="visual-eyebrow">MAKE ROOM FOR THE JOURNEY</p>
                        <h2>Every great trip starts here.</h2>
                        <p>
                            Create your account and bring your trips, plans,
                            and travel budget together in one place.
                        </p>
                    </div>

                    <span className="visual-footer">
                        Your journey, thoughtfully planned.
                    </span>
                </aside>

                <div className="login-content">
                    <div className="login-form-wrap">
                        <div className="login-heading">
                            <p className="login-eyebrow">GET STARTED</p>
                            <h1>Create your account</h1>
                            <p>Sign up to start planning your next journey.</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="login-field">
                                <label htmlFor="register-first-name">First name</label>
                                <input
                                    id="register-first-name"
                                    type="text"
                                    value={firstName}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    placeholder="Your first name"
                                    autoComplete="given-name"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="register-last-name">Last name</label>
                                <input
                                    id="register-last-name"
                                    type="text"
                                    value={lastName}
                                    onChange={(event) => setLastName(event.target.value)}
                                    placeholder="Your last name"
                                    autoComplete="family-name"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="register-email">Email address</label>
                                <input
                                    id="register-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="register-password">Password</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="register-confirm-password">
                                    Confirm password
                                </label>
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Enter your password again"
                                    autoComplete="new-password"
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
                                {loading ? "Creating account..." : "Create account"}
                                {!loading && <span aria-hidden="true">→</span>}
                            </button>
                        </form>

                        <p className="login-note">
                            Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;