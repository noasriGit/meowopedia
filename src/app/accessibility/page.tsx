import { createStaticPageHandlers } from "@/lib/routing/static-page-routes";

const handlers = createStaticPageHandlers("accessibility");

export const revalidate = 86400;
export const generateMetadata = handlers.generateMetadata;
export default handlers.Page;
