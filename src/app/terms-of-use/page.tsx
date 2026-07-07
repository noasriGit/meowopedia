import { createStaticPageHandlers } from "@/lib/routing/static-page-routes";

const handlers = createStaticPageHandlers("terms-of-use");

export const revalidate = 86400;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
