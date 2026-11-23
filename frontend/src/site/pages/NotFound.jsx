import { Icon } from "../components/Icon";
import { usePageMeta } from "../components/Seo";
import { SiteLink } from "../Transition";

export default function NotFound() {
  usePageMeta("Page not found");
  return (
    <header className="container page-intro">
      <div className="stack">
        <h1>Page not found</h1>
        <p className="lead">That page doesn’t exist.</p>
        <SiteLink className="btn btn--primary btn--lg" to="/">
          Back to home <Icon name="arrow-right" />
        </SiteLink>
      </div>
    </header>
  );
}
