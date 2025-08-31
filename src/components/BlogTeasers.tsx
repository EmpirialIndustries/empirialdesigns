import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogTeasers = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Things Every Business Website Must Have",
      excerpt: "Essential elements that turn visitors into customers and boost your online credibility.",
      category: "Web Design Tips",
      date: "2024-03-15",
      readTime: "5 min read",
      slug: "/blog"
    },
    {
      id: 2,
      title: "Brand Consistency: Why It Matters More Than You Think",
      excerpt: "How consistent branding across all touchpoints can increase revenue by up to 23%.",
      category: "Branding",
      date: "2024-03-12",
      readTime: "4 min read",
      slug: "/blog"
    },
    {
      id: 3,
      title: "SEO Basics for Small Business Owners",
      excerpt: "Simple strategies to improve your website's visibility on Google without technical expertise.",
      category: "Small Biz Growth",
      date: "2024-03-08",
      readTime: "6 min read",
      slug: "/blog"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest from Our <span className="text-gradient">Blog</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical tips, insights, and strategies to help your business grow online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post) => (
            <Card key={post.id} className="elegant-shadow smooth-transition hover:elegant-glow group">
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="group-hover:text-primary smooth-transition">
                  {post.title}
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  <Link to={post.slug}>
                    <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground smooth-transition">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogTeasers;