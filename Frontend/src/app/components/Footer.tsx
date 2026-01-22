import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__grid">
                    {/* Brand Column */}
                    <div className="footer__col">
                        <div className="footer__brand">
                            <span className="footer__logo">🎓</span>
                            <span className="footer__brand-name">ClassBridge</span>
                        </div>
                        <p className="footer__tagline">
                            Modern school management made simple. Empowering educators and students.
                        </p>
                    </div>

                    {/* Product Column */}
                    <div className="footer__col">
                        <h3 className="footer__heading">Product</h3>
                        <ul className="footer__links">
                            <li><Link href="/#features">Features</Link></li>
                            <li><Link href="/register">Get Started</Link></li>
                            <li><Link href="/login">Sign In</Link></li>
                            <li><Link href="/dashboard">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="footer__col">
                        <h3 className="footer__heading">Resources</h3>
                        <ul className="footer__links">
                            <li><a href="#docs">Documentation</a></li>
                            <li><a href="#support">Support</a></li>
                            <li><a href="#guides">Guides</a></li>
                            <li><a href="#api">API</a></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="footer__col">
                        <h3 className="footer__heading">Company</h3>
                        <ul className="footer__links">
                            <li><a href="#about">About</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p className="footer__copyright">
                        © {currentYear} ClassBridge. All rights reserved.
                    </p>
                    <div className="footer__legal">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#cookies">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
