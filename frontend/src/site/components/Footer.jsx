import { Link } from "react-router";
import { ADMIN_PATH } from "../../lib/adminPath";
import { safeHref, telHref } from "../../lib/format";
import { useSite } from "../SiteContext";
import { SiteLink } from "../Transition";
import { Icon } from "./Icon";
import { Split } from "./Split";

export function Footer() {
  const { site, brand } = useSite();
  const phone = site.phone;
  const email = site.email;
  const fb = safeHref(site.facebook_url);
  const ig = safeHref(site.instagram_url);
  const hasConnect = phone || email || fb || ig;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="stack">
            {brand && <p className="eyebrow">{brand}</p>}
            {(site.footer_title || site.footer_accent) && (
              <h2>
                {site.footer_title} {site.footer_accent && <span className="accent">{site.footer_accent}</span>}
              </h2>
            )}
            {site.footer_blurb && <p>{site.footer_blurb}</p>}
          </div>
          <nav aria-label="Explore">
            <h3>Explore</h3>
            <ul>
              <li>
                <SiteLink to="/menu">Menu and prices</SiteLink>
              </li>
              <li>
                <SiteLink to="/branches">Branches and hours</SiteLink>
              </li>
              <li>
                <SiteLink to="/reserve">Reserve a table</SiteLink>
              </li>
              <li>
                <SiteLink to="/track">Reservation status</SiteLink>
              </li>
              <li>
                <SiteLink to="/gallery">Gallery</SiteLink>
              </li>
            </ul>
          </nav>
          {hasConnect && (
            <div>
              <h3>Let’s connect</h3>
              <ul>
                {phone && (
                  <li>
                    <a href={telHref(phone)}>
                      <Icon name="phone" /> {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a href={`mailto:${email}`}>
                      <Icon name="mail" /> {email}
                    </a>
                  </li>
                )}
                {fb && (
                  <li>
                    <a href={fb} target="_blank" rel="noopener noreferrer">
                      <Icon name="facebook" /> Facebook
                    </a>
                  </li>
                )}
                {ig && (
                  <li>
                    <a href={ig} target="_blank" rel="noopener noreferrer">
                      <Icon name="instagram" /> Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        {brand && <Split as="div" className="footer-mark" title={brand} ariaHidden />}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {brand} {site.footer_credit}
          </p>
          <ul>
            <li>
              <SiteLink to="/privacy">Privacy</SiteLink>
            </li>
            <li>
              <Link className="footer-admin" to={ADMIN_PATH}>
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
