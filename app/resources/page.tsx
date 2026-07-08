// main/app/resources/page.tsx

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { getBlogPosts } from "@/lib/data";

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
};

export default async function ResourcesPage() {
  const blogPosts = (await getBlogPosts()) as unknown as BlogPost[];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Learning hub"
        title="Resources"
        description="Articles and playbooks for safer applications, better organization, and faster opportunity discovery."
      />

      <div className="grid-2">
        <div className="card">
          <h3>Featured articles</h3>

          <div className="timeline" style={{ marginTop: 16 }}>
            {blogPosts.map((post) => (
              <div key={post.slug} className="card muted-bg">
                <div
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <Badge>{post.category}</Badge>
                  <span className="small">{post.readTime}</span>
                </div>

                <h4 style={{ marginTop: 10 }}>{post.title}</h4>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>What to keep in your workflow</h3>

          <div className="timeline" style={{ marginTop: 16 }}>
            <div className="timeline-item">
              <strong>Source trail</strong>
              <div className="small">
                Keep the original listing link, source label, and rule page.
              </div>
            </div>

            <div className="timeline-item">
              <strong>Document bundle</strong>
              <div className="small">
                Store transcripts, tax forms, IDs, and receipts in one place.
              </div>
            </div>

            <div className="timeline-item">
              <strong>Decision notes</strong>
              <div className="small">
                Save why you applied, what you submitted, and what still needs
                attention.
              </div>
            </div>

            <div className="timeline-item">
              <strong>Reminder system</strong>
              <div className="small">
                Use calendar alerts for deadlines, follow-ups, and missing
                items.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <NewsletterSignup />
      </div>
    </div>
  );
}