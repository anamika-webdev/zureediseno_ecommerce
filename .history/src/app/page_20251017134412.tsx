import { OrganizationStructuredData, WebSiteStructuredData } from '@/components/seo/StructuredData';

export default function HomePage() {
  return (
    <>
      {/* Add structured data */}
      <OrganizationStructuredData />
      <WebSiteStructuredData />
      
      {/* Your page content */}
      <div className="min-h-screen">
        {/* ... your homepage content ... */}
      </div>
    </>
  );
}